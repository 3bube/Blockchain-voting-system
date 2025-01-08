import { createContext, useReducer, useEffect, useState } from "react";
import newRequest from "../utils/newRequest";
import { ethers } from "ethers";

export const AuthContext = createContext();

// Action Types
export const AUTH_ACTIONS = {
  SET_LOADING: "SET_LOADING",
  SET_USER: "SET_USER",
  LOGOUT: "LOGOUT",
  AUTH_ERROR: "AUTH_ERROR",
};

// Initial State
const initialState = {
  currentUser: null,
  loading: true,
  error: null,
};

// Reducer Function
const authReducer = (state, action) => {
  switch (action.type) {
    case AUTH_ACTIONS.SET_LOADING:
      return {
        ...state,
        loading: action.payload,
      };
    case AUTH_ACTIONS.SET_USER:
      return {
        ...state,
        currentUser: action.payload,
        loading: false,
        error: null,
      };
    case AUTH_ACTIONS.LOGOUT:
      return {
        ...state,
        currentUser: null,
        loading: false,
        error: null,
      };
    case AUTH_ACTIONS.AUTH_ERROR:
      return {
        ...state,
        error: action.payload,
        loading: false,
      };
    default:
      return state;
  }
};

const contractAddress = import.meta.env.VITE_CONTRACT_ADDRESS;

const contractABI = [
  {
    inputs: [
      { internalType: "string", name: "_title", type: "string" },
      { internalType: "string", name: "_description", type: "string" },
      { internalType: "string[]", name: "_optionNames", type: "string[]" },
      { internalType: "uint256", name: "_startTime", type: "uint256" },
      { internalType: "uint256", name: "_endTime", type: "uint256" },
      { internalType: "uint256", name: "_maxParticipants", type: "uint256" },
      { internalType: "string", name: "_roomName", type: "string" },
      { internalType: "string", name: "_accessCode", type: "string" },
    ],
    name: "createVote",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [{ internalType: "uint256", name: "_voteId", type: "uint256" }],
    name: "getVoteResults",
    outputs: [
      { internalType: "string[]", name: "names", type: "string[]" },
      { internalType: "uint256[]", name: "counts", type: "uint256[]" },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      { internalType: "uint256", name: "_voteId", type: "uint256" },
      { internalType: "uint256", name: "_optionId", type: "uint256" },
    ],
    name: "castVote",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "uint256",
        name: "voteId",
        type: "uint256",
      },
      {
        indexed: true,
        internalType: "address",
        name: "voter",
        type: "address",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "optionId",
        type: "uint256",
      },
    ],
    name: "VoteCast",
    type: "event",
  },
  {
    inputs: [],
    name: "getAllVotes",
    outputs: [
      { name: "voteIds", type: "uint256[]" },
      { name: "titles", type: "string[]" },
      { name: "descriptions", type: "string[]" },
      { name: "startTimes", type: "uint256[]" },
      { name: "endTimes", type: "uint256[]" },
      { name: "isActives", type: "bool[]" },
      { name: "creators", type: "address[]" },
      { name: "maxParticipants", type: "uint256[]" },
      { name: "currentParticipants", type: "uint256[]" },
      { name: "roomNames", type: "string[]" },
      { name: "accessCodes", type: "string[]" },
      { name: "statuses", type: "string[]" },
    ],
    stateMutability: "view",
    type: "function",
  },
];

export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);
  const [contract, setContract] = useState(null);

  useEffect(() => {
    const checkUser = async () => {
      try {
        const token = localStorage.getItem("token");
        if (token) {
          const response = await newRequest.get("/auth/me");
          dispatch({
            type: AUTH_ACTIONS.SET_USER,
            payload: response.data.data,
          });
        } else {
          dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: false });
        }
      } catch (error) {
        console.error("Auth check failed:", error);
        localStorage.removeItem("token");
        dispatch({
          type: AUTH_ACTIONS.AUTH_ERROR,
          payload: "Session expired",
        });
      }
    };

    checkUser();
  }, []);

  const initializeContract = async () => {
    try {
      // Use Hardhat's local JSON-RPC provider
      const provider = new ethers.JsonRpcProvider("http://127.0.0.1:8545");

      // Use the first pre-funded account from Hardhat
      const signer = await provider.getSigner(0);

      // Create a contract instance with the signer
      const contractInstance = new ethers.Contract(
        contractAddress,
        contractABI,
        signer
      );
      setContract(contractInstance);
    } catch (error) {
      console.error("Error initializing contract:", error);
    }
  };

  useEffect(() => {
    initializeContract();
  }, []);

  const login = async (email, password) => {
    try {
      dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: true });
      const response = await newRequest.post("/auth/login", {
        email,
        password,
      });
      console.log("Login response:", response.data); // Debugging log
      const { token, ...userData } = response.data.data;
      localStorage.setItem("token", token);
      dispatch({ type: AUTH_ACTIONS.SET_USER, payload: userData });
      console.log("User data set:", userData); // Debugging log
      return { success: true };
    } catch (error) {
      const errorMessage = error.response?.data?.message || "Login failed";
      dispatch({
        type: AUTH_ACTIONS.AUTH_ERROR,
        payload: errorMessage,
      });
      console.error("Login error:", errorMessage); // Debugging log
      return { success: false, message: errorMessage };
    }
  };

  const register = async (name, email, password) => {
    try {
      dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: true });
      const response = await newRequest.post("/auth/register", {
        name,
        email,
        password,
      });
      const { token, ...userData } = response.data.data;
      localStorage.setItem("token", token);
      dispatch({ type: AUTH_ACTIONS.SET_USER, payload: userData });
      return { success: true };
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "Registration failed";
      dispatch({
        type: AUTH_ACTIONS.AUTH_ERROR,
        payload: errorMessage,
      });
      return { success: false, message: errorMessage };
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    dispatch({ type: AUTH_ACTIONS.LOGOUT });
    window.location.href = "/login";
  };

  const value = {
    ...state,
    contract,
    login,
    register,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

import React, { createContext, useReducer, useEffect } from "react";
import newRequest from "../utils/newRequest";

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

export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

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
    login,
    register,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

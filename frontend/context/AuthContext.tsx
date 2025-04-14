"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
} from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import newRequest from "@/utils/newRequest";

interface User {
  name: string;
  id: string;
  role: string;
  email: string;
  nin: string;
}

interface AuthContextType {
  user: User | null;
  isAdmin: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (
    name: string,
    email: string,
    nin: string,
    password: string
  ) => Promise<void>;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Check if user is logged in on initial load
    const initializeAuth = async () => {
      setLoading(true);
      const token = localStorage.getItem("token");
      
      if (token) {
        // Set token in axios headers
        newRequest.defaults.headers.common["Authorization"] = `Bearer ${token}`;
        await fetchCurrentUser(token);
      } else {
        setLoading(false);
      }
    };
    
    initializeAuth();
  }, []);

  const fetchCurrentUser = async (token: string) => {
    try {
      // Set the token in the newRequest instance
      newRequest.defaults.headers.common["Authorization"] = `Bearer ${token}`;
      
      const response = await newRequest.get("/auth/me");

      if (response.data.success) {
        setUser(response.data.user);
      } else {
        // Token is invalid or expired
        localStorage.removeItem("token");
        newRequest.defaults.headers.common["Authorization"] = "";
      }
    } catch (error) {
      console.error("Failed to fetch user:", error);
      // Clear token on error
      localStorage.removeItem("token");
      newRequest.defaults.headers.common["Authorization"] = "";
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    setLoading(true);
    try {
      const { data, status } = await newRequest.post("/auth/login", {
        email,
        password,
      });

      if (status === 200 && data.success) {
        // Save token to localStorage
        const token = data.data.token;
        localStorage.setItem("token", token);
        
        // Set the token in the newRequest instance
        newRequest.defaults.headers.common["Authorization"] = `Bearer ${token}`;
        
        // Set user data
        setUser(data.data);
        
        // Redirect based on role
        if (data.data.role === "admin") {
          router.push("/admin/dashboard");
        } else {
          router.push("/dashboard");
        }
      } else {
        toast.error(data.error || "Login failed");
      }
    } catch (error) {
      const err = error as { 
        response?: { data?: { error?: string } }; 
        message?: string 
      };
      toast.error(
        err.response?.data?.error || 
        err.message || 
        "An error occurred during login"
      );
    } finally {
      setLoading(false);
    }
  };

  const register = async (
    name: string,
    email: string,
    nin: string,
    password: string
  ) => {
    setLoading(true);
    try {
      const { status } = await newRequest.post("/auth/register", {
        name,
        email,
        nin,
        password,
      });

      toast.message("Registration successful", {
        description: "Your account has been created",
      });

      if (status) router.push("/login");
    } catch (error) {
      if (error instanceof Error) {
        toast.message("Registration failed", {
          description: error.message || "An error occurred during registration",
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    // Remove token from localStorage
    localStorage.removeItem("token");
    
    // Clear the authorization header
    newRequest.defaults.headers.common["Authorization"] = "";
    
    // Clear user state
    setUser(null);
    
    // Redirect to login page
    router.push("/login");
    
    toast.success("You have been logged out successfully");
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAdmin: user?.role === "admin" || false,
        login,
        register,
        logout,
        loading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

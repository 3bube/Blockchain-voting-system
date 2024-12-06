import axios from "axios";

const isDevelopment = window.location.hostname === "localhost";
const DEVELOPMENT_URL = "http://localhost:5000/api";
const PRODUCTION_URL = "https://blockchain-voting-system-63nj.vercel.app/api";

const BASE_URL = isDevelopment ? DEVELOPMENT_URL : PRODUCTION_URL;

const newRequest = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
});

// Request interceptor
newRequest.interceptors.request.use(
  (config) => {
    // Get token from localStorage
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
newRequest.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Handle 401 errors (unauthorized)
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      // Clear token and redirect to login
      localStorage.removeItem("token");
      window.location.href = "/login";
    }

    return Promise.reject(error);
  }
);

export default newRequest;

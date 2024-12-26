import { Navigate, Outlet } from "react-router-dom";
import useAuth from "../context/useAuth";

const ProtectedRoute = ({ children }) => {
  const { currentUser: user } = useAuth();
  console.log("Current user in ProtectedRoute:", user); // Debugging log

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default ProtectedRoute;

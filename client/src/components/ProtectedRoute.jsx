import { Navigate, Outlet } from "react-router-dom";
import useAuth from "../context/useAuth";

const ProtectedRoute = () => {
  const { currentUser: user } = useAuth();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;

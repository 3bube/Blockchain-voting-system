import { Routes, Route } from "react-router-dom";
import LandingPage from "../pages/LandingPage";
import Layout from "../components/Layout";
import DashboardLayout from "../components/DashboardLayout";
import SignUp from "../pages/SignUp";
import Login from "../pages/Login";
import Dashboard from "../pages/Dashboard";
import OngoingVote from "../components/Dashboard/OngoingVote";
import History from "../components/Dashboard/History";
import CreateVote from "../components/Dashboard/CreateVote";

export const AppRoutes = () => (
  <Routes>
    <Route path="/" element={<Layout />}>
      <Route index element={<LandingPage />} />
      <Route path="signup" element={<SignUp />} />
      <Route path="login" element={<Login />} />
    </Route>
    <Route path="/dashboard" element={<DashboardLayout />}>
      <Route index element={<Dashboard />} />
      <Route path="vote" element={<OngoingVote />} />
      <Route path="history" element={<History />} />
      <Route path="create-vote" element={<CreateVote />} />
      {/* Add more dashboard routes here */}
    </Route>
  </Routes>
);

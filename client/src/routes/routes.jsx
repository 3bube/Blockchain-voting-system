import { Routes, Route } from "react-router-dom";
import LandingPage from "../pages/LandingPage";
import Layout from "../components/Layout";
import DashboardLayout from "../components/DashboardLayout";
import SignUp from "../pages/SignUp";
import Login from "../pages/Login";
import Dashboard from "../pages/Dashboard";
import Room from "../pages/Room";
import OngoingVote from "../components/Dashboard/OngoingVote";
import History from "../components/Dashboard/History";
import CreateVote from "../components/Dashboard/CreateVote";
import JoinRoom from "../components/Dashboard/JoinRoom";
import Settings from "../components/Dashboard/Settings";
import VoteDetails from "../pages/VoteDetails";
import Test from "../components/test";
// import ProtectedRoute from "../components/ProtectedRoute";

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
      <Route path="join-room" element={<JoinRoom />} />
      <Route path="room/:id" element={<Room />} />
      <Route path="vote-details" element={<VoteDetails />} />
      <Route path="settings" element={<Settings />} />
      <Route path="test" element={<Test />} />
      {/* Add more dashboard routes here */}
    </Route>
  </Routes>
);

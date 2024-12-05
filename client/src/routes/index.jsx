import { createBrowserRouter } from "react-router-dom";
import LandingPage from "../pages/LandingPage";
import Vote from "../pages/Vote";
import Results from "../pages/Results";
import Layout from "../components/Layout";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <Layout />,
    children: [
      {
        index: true,
        element: <LandingPage />,
      },
      {
        path: "vote",
        element: <Vote />,
      },
      {
        path: "results",
        element: <Results />,
      },
    ],
  },
]);

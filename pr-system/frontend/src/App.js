import { createBrowserRouter, RouterProvider, Navigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { useEffect } from "react";
import { Toaster } from "sonner";

import PrLayout from "./components/layout/PrLayout";
import LoginPage from "./pages/LoginPage";
import HomePage from "./pages/pr/HomePage";
import CreateSurveyPage from "./pages/pr/CreateSurveyPage";
import StatisticsPage from "./pages/pr/StatisticsPage";
import SurveysPage from "./pages/pr/SurveysPage";
import SurveyProfilePage from "./pages/pr/SurveyProfilePage";
import { getProfile } from "./redux/actions/accountActions";

/**
 * Standalone PR (Patient Relations) application.
 *
 * This used to live inside the ticketing SPA under the `/pr` prefix. As its own
 * app the survey screens sit at the root, so the URLs are `/`, `/create`,
 * `/view`, `/statistics` instead of `/pr/...`.
 */
const router = createBrowserRouter([
  { path: "/login", element: <LoginPage /> },
  {
    path: "/",
    element: <PrLayout />,
    children: [
      { path: "", element: <HomePage /> },
      { path: "create", element: <CreateSurveyPage /> },
      { path: "statistics", element: <StatisticsPage /> },
      { path: "view", element: <SurveysPage /> },
      { path: "view/:surveyById", element: <SurveyProfilePage /> },
      // Keep the old /pr/* links working (bookmarks, links from the ticket app).
      { path: "pr", element: <Navigate to="/" replace /> },
      { path: "pr/create", element: <Navigate to="/create" replace /> },
      { path: "pr/statistics", element: <Navigate to="/statistics" replace /> },
      { path: "pr/view", element: <Navigate to="/view" replace /> },
    ],
  },
  { path: "*", element: <Navigate to="/" replace /> },
]);

function App() {
  const dispatch = useDispatch();

  // Restore the session once on mount. This must NOT depend on `isLogged`:
  // getProfile.pending sets it false and getProfile.fulfilled sets it true, so
  // depending on it makes the effect re-fire forever.
  useEffect(() => {
    if (localStorage.getItem("Token")) dispatch(getProfile());
  }, [dispatch]);

  return (
    <div className="App">
      <Toaster position="top-center" richColors closeButton />
      <RouterProvider router={router} />
    </div>
  );
}

export default App;

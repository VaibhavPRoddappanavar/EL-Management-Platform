import { useEffect, useState } from "react";
import {
  Navigate,
  Route,
  BrowserRouter as Router,
  Routes,
} from "react-router-dom";
import ForgotPasswordPage from "./components/ForgotPasswordPage";
import ResetPasswordPage from "./components/ResetPasswordPage";
import SignInSignUp from "./components/SignInSignUp"; // Import the new SignInSignUp component
import CreateTeamPage from "./pages/CreateTeamPage";
import TeamPage from "./pages/TeamPage";

/* Admin imports */

import AdminDashboard from "./components/admin/AdminDashboard";
import AdminLogin from "./components/admin/AdminLogin";
import AdminHome from "./pages/admin/AdminHome";
import UnassignedStudents from "./components/admin/UnassignedStudents"; // Import the new UnassignedStudents component

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(
    !!localStorage.getItem("token")
  );

  useEffect(() => {
    const handleStorageChange = () =>
      setIsAuthenticated(!!localStorage.getItem("token"));
    window.addEventListener("storage", handleStorageChange);

    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  return (
    <Router>
      <Routes>
        {/* General Routes */}
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<SignInSignUp />} />
        <Route path="/signup" element={<SignInSignUp />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password/:token" element={<ResetPasswordPage />} />
        <Route
          path="/team"
          element={isAuthenticated ? <TeamPage /> : <Navigate to="/login" />}
        />
        <Route path="/create-team" element={<CreateTeamPage />} />

        {/* Admin Routes */}
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin/home/*" element={<AdminHome />} />
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
        <Route
          path="/admin/unassigned"
          element={<UnassignedStudents></UnassignedStudents>}
        />
      </Routes>
    </Router>
  );
}

export default App;

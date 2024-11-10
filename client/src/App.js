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
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<SignInSignUp />} />{" "}
        {/* Use SignInSignUp here */}
        <Route path="/signup" element={<SignInSignUp />} />{" "}
        {/* Also use SignInSignUp here */}
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
      </Routes>
    </Router>
  );
}

export default App;

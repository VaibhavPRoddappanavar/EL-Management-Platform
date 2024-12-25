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
import TeamManagementView from "./components/Team/TeamManagementView";
import CreateTeamPage from "./pages/Students/CreateTeamPage";
import TeamManagement from "./pages/Students/TeamManagement";
import TeamPage from "./pages/Students/TeamPage";
import Navbar from "./components/Navbar";
import TeacherLogin from "./pages/Teachers/TeacherLogin";
import TeacherHome from "./pages/Teachers/TeacherHome";
import TeacherDashboard from "./components/teacher/TeacherDashboard";
import UnassignedStudents from './components/teacher/UnassignedStudents';

/* Admin imports */

import AdminDashboard from "./components/admin/AdminDashboard";
import AdminLogin from "./components/admin/AdminLogin";
import AdminHome from "./pages/admin/AdminHome";
import UnassignedStudentsAdmin from "./components/admin/UnassignedStudents"; // Import the new UnassignedStudents component

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(
    !!localStorage.getItem("token")
  );
  const [isTeacherAuthenticated, setIsTeacherAuthenticated] = useState(
    !!localStorage.getItem("teacherToken")
  );

  useEffect(() => {
    const handleStorageChange = () =>
      setIsAuthenticated(!!localStorage.getItem("token"));
    window.addEventListener("storage", handleStorageChange);

    const handleTeacherStorageChange = () =>
      setIsTeacherAuthenticated(!!localStorage.getItem("teacherToken"));
    window.addEventListener("storage", handleTeacherStorageChange);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener("storage", handleTeacherStorageChange);
    };
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
          element={isAuthenticated ? <Navbar /> : <Navigate to="/login" />}
        />
        <Route path="/create-team" element={<CreateTeamPage />} />
        <Route path="/TeamManagement" element={<TeamManagement />} />
        <Route path="/team-management" element={<TeamManagementView />} />

        {/* Teacher Routes */}
        <Route path="/teacher/login" element={<TeacherLogin />} />
        <Route
          path="/teacher/home"
          element={
            isTeacherAuthenticated ? (
              <TeacherHome />
            ) : (
              <Navigate to="/teacher/login" />
            )
          }
        />
        <Route
          path="/teacher/dashboard"
          element={
            isTeacherAuthenticated ? (
              <TeacherDashboard />
            ) : (
              <Navigate to="/teacher/login" />
            )
          }
        />
        <Route
          path="/teacher/unassigned"
          element={
            isTeacherAuthenticated ? (
              <UnassignedStudents />
            ) : (
              <Navigate to="/teacher/login" />
            )
          }
        />

        {/* Admin Routes */}
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin/home/*" element={<AdminHome />} />
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
        <Route
          path="/admin/unassigned"
          element={<UnassignedStudentsAdmin></UnassignedStudentsAdmin>}
        />
      </Routes>
    </Router>
  );
}

export default App;

import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom"; // Updated import for useNavigate

const AdminLogout = () => {
  const navigate = useNavigate(); // useNavigate hook for redirection

  useEffect(() => {
    // Remove the JWT token from localStorage to log the user out
    localStorage.removeItem("adminToken"); // Adjust the key name if needed

    // Optionally, you can notify the backend about the logout, but it's not necessary in a JWT-based system.

    // Redirect the user to the login page after logging out
    navigate("/admin/login"); // Adjust this to the login page route if needed
  }, [navigate]);

  return (
    <div>
      <h1>Logging out...</h1>
    </div>
  );
};

export default AdminLogout;

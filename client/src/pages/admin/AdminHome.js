import React from "react";
import { Route, Routes } from "react-router-dom";
import Navbar from "../../components/admin/AdminNavbar";
import Sidebar from "../../components/admin/AdminSidebar";
import WelcomeSection from "../../components/admin/WelcomeSection";
import AdminData from "../../components/admin/AdminDashboard"; // Assuming AdminDashboard is used as AdminData
import "./AdminHome.css";

const Dashboard = () => {
  return (
    <div className="dashboard">
      <Navbar />
      <div className="content">
        <Sidebar />
        <div className="main-content">
          <Routes>
            {/* These routes are now relative to /admin/home */}
            <Route path="component1" element={<WelcomeSection />} />
            <Route path="component2" element={<AdminData />} />
          </Routes>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

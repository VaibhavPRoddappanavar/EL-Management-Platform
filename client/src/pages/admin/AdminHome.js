import React, { useState } from "react";
import { Route, Routes } from "react-router-dom";
import Navbar from "../../components/admin/AdminNavbar";
import Sidebar from "../../components/admin/AdminSidebar";
import WelcomeSection from "../../components/admin/WelcomeSection";
import AdminData from "../../components/admin/AdminDashboard"; // Assuming AdminDashboard is used as AdminData
import AdminLogout from "../../components/admin/AdminLogout";
import "./AdminHome.css";

const Dashboard = () => {
  // Step 1: Manage the hover state
  const [isSidebarHovered, setSidebarHovered] = useState(false);

  return (
    <div className="adminhome">
      <div className="dashboard">
        {/* Step 2: Pass the hover state to Navbar */}
        <Navbar isSidebarHovered={isSidebarHovered} />
        <div className="content">
          {/* Step 3: Pass hover handlers to Sidebar */}
          <Sidebar
            onMouseEnter={() => setSidebarHovered(true)} // When sidebar is hovered, set state to true
            onMouseLeave={() => setSidebarHovered(false)} // When hover ends, set state to false
          />
          <div className="main-content">
            <Routes>
              <Route path="" element={<WelcomeSection />} />
              <Route path="board" element={<AdminData />} />
              <Route path="logout" element={<AdminLogout />} />
            </Routes>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

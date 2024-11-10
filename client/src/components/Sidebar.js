import React from 'react';
import { FaChartBar, FaCog, FaHome, FaQuestionCircle, FaSignOutAlt, FaTasks, FaUser, FaWallet } from 'react-icons/fa';
import './SidebarStyle.css';

const Sidebar = () => {
  return (
    <nav  className="sidebar">
      <ul>
        <li><a href="#" className="logo">
          <img src="/logo.jpg" alt="logo" />
          <span className="nav-item">Dashboard</span>
        </a></li>
        
        <li><a href="#">
          <FaHome />
          <span className="nav-item">Home</span>
        </a></li>
        
        <li><a href="#">
          <FaUser />
          <span className="nav-item">Profile</span>
        </a></li>
        
        <li><a href="#">
          <FaWallet />
          <span className="nav-item">Wallet</span>
        </a></li>
        
        <li><a href="#">
          <FaChartBar />
          <span className="nav-item">Analytics</span>
        </a></li>
        
        <li><a href="#">
          <FaTasks />
          <span className="nav-item">Tasks</span>
        </a></li>
        
        <li><a href="#">
          <FaCog />
          <span className="nav-item">Settings</span>
        </a></li>
        
        <li><a href="#">
          <FaQuestionCircle />
          <span className="nav-item">Help</span>
        </a></li>
        
        <li><a href="#" className="logout">
          <FaSignOutAlt />
          <span className="nav-item">Log out</span>
        </a></li>
      </ul>
    </nav>
  );
};

export default Sidebar;

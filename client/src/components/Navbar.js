import React, { useState } from 'react';
import profilePic from '../images/profile.png';
import collegelogo from '../images/rvlogo.png';
import './NavbarStyle.css';

const Navbar = () => {
  const [dropdownVisible, setDropdownVisible] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const toggleDropdown = () => {
    setDropdownVisible(!dropdownVisible);
  };

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <div className="navvv">
      <div className="navbar">
        {/* Menu Icon and Search Bar */}
        <div className="left-container">
          <img src={collegelogo} ></img>
        </div>

        <div className='nav-items'>
            <div className="nav-item">
              <a href='#'>Home</a>
            </div>
            <div className="nav-item">
              <a href='#'>Team</a>
            </div>
            <div className="nav-item">
              <a href='#'>Announcement</a>
            </div>
            <div className="nav-item">
              <a href='#'>Marks</a>
            </div>
          </div>

        {/* Right Side: Notification & Profile */}
        <div className="right-container">
          <div className="profile" onClick={toggleDropdown}>
            <img
              src={profilePic}
              alt="Profile"
              className="profile-image"
            />
            <span className="profile-name">Profile</span>
          </div>

          {/* Dropdown */}
          {dropdownVisible && (
            <div className="dropdown">
              <p className="user-info">Name : Vaibhav</p>
              <p className="user-email">Email : johndoe@example.com</p>
              <p className="user-email">USN : 1RV23CS278</p>
              <p className="user-email">BRANCH : CS</p>
              <button className="logout-button">Logout</button>
            </div>
          )}
        </div>
      </div>

      {/* Sidebar Component
      <Sidebar isOpen={sidebarOpen} toggleSidebar={toggleSidebar} /> */}
    </div>
  );
};

export default Navbar;

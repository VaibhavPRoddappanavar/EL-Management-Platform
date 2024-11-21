import React, { useState } from "react";
import collegelogo from "../../images/rvlogo.png"; // Adjust the path as necessary
import profilePic from "../../images/profile.png"; // Adjust the path as necessary
import "./AdminNavbar.css";

const Navbar = ({ isSidebarHovered }) => {
  const [dropdownVisible, setDropdownVisible] = useState(false);

  const toggleDropdown = () => {
    setDropdownVisible(!dropdownVisible);
  };

  return (
    <div
      className={`admin-navv ${
        isSidebarHovered ? "shifted-navbar" : "release-navbar"
      }`}
    >
      <div className="admin-dash">
        <div className="admin-mainbox">
          <div className="top-container">
            <div className="college">
              <img src={collegelogo} alt="College Logo" className="logo" />
              <span className="name">RV College of Engineering</span>
            </div>

            <div className="profile" onClick={toggleDropdown}>
              <img src={profilePic} alt="Profile" className="profile-image" />
              <span className="profile-name">Profile</span>
            </div>

            {/* Dropdown */}
            {dropdownVisible && (
              <div className="dropdown">
                <p className="user-info">Name: Vaibhav</p>
                <p className="user-email">Email: johndoe@example.com</p>
                <p className="user-email">USN: 1RV23CS278</p>
                <p className="user-email">Branch: CS</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Navbar;

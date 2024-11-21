import React from "react";
import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faHome,
  faUserFriends,
  faBullhorn,
  faMessage,
  faSignOut,
} from "@fortawesome/free-solid-svg-icons";
import "./AdminSidebar.css";

const Sidebar = ({ onMouseEnter, onMouseLeave }) => {
  return (
    <div
      className="sidebar-container"
      onMouseEnter={onMouseEnter} // Step 1: Trigger hover state change
      onMouseLeave={onMouseLeave} // Step 2: Trigger hover state change
    >
      <div className="sidebar-wrapper">
        <div className="sidebar-menu">
          <div className="menu-item">
            <Link to="">
              <FontAwesomeIcon icon={faHome} className="iconic" />
              <span>Home</span>
            </Link>
          </div>
          <div className="menu-item">
            <Link to="board">
              <FontAwesomeIcon icon={faUserFriends} />
              <span>Dashboard</span>
            </Link>
          </div>
          <div className="menu-item">
            <Link to="/announcement">
              <FontAwesomeIcon icon={faBullhorn} />
              <span>Announcement</span>
            </Link>
          </div>
          <div className="menu-item">
            <Link to="/messages">
              <FontAwesomeIcon icon={faMessage} />
              <span>Messages</span>
            </Link>
          </div>
          <div className="menu-item">
            <div className="logout">
              <Link to="logout">
                <FontAwesomeIcon icon={faSignOut} />
                <span>Logout</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;

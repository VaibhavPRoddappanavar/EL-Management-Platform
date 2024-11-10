import React from "react";
import { Link } from "react-router-dom";
import "./AdminSidebar.css";

const Sidebar = () => {
  return (
    <div className="sidebar">
      <ul>
        <li>
          <Link to="component1">Welcome</Link> {/* Relative path */}
        </li>
        <li>
          <Link to="component2">Dashboard</Link> {/* Relative path */}
        </li>
      </ul>
    </div>
  );
};

export default Sidebar;

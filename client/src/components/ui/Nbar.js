import axios from "axios";
import React, { useEffect, useState } from "react";
import profilePic from "../../images/profile.png"; // Adjust the path as necessary
import collegelogo from "../../images/rvlogo.png"; // Adjust the path as necessary

const Nbar = ({ isSidebarHovered }) => {
  const [dropdownVisible, setDropdownVisible] = useState(false);
  const [studentDetails, setStudentDetails] = useState({
    name: '',
    email: '',
    branch: ''
  });

  useEffect(() => {
    const fetchStudentDetails = async () => {
      try {
        const token = localStorage.getItem('token');
        const email = localStorage.getItem('userEmail');
        const response = await axios.get(
          `http://localhost:5000/student-details?email=${email}`,
          {
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        );
        setStudentDetails({
          name: response.data.name,
          email: response.data.email,
          branch: response.data.branch
        });
      } catch (error) {
        console.error("Error fetching student details:", error);
      }
    };

    fetchStudentDetails();
  }, []);

  const toggleDropdown = () => {
    setDropdownVisible(!dropdownVisible);
  };

  const handleLogout = () => {
    localStorage.clear(); // Clear all stored user data
    window.location.href = "/login"; // Redirect to login page
  };

  return (
    <nav className="fixed top-0 w-full z-50 bg-white shadow-md h-20 mb-80">
      <div className="flex justify-between items-center p-4">
        {/* College Logo and Name */}
        <div className="flex items-center">
          <img src={collegelogo} alt="RV Logo" className="w-10 h-10 rounded-full mr-3" />
          <span className="text-lg font-semibold text-gray-700">RV College of Engineering</span>
        </div>

        {/* Profile Section */}
        <div
          className="relative flex items-center cursor-pointer"
          onClick={toggleDropdown}
        >
          <img
            src={profilePic}
            alt="Profile"
            className="w-8 h-8 rounded-full"
          />
          <span className="ml-2 text-sm font-medium text-gray-700">
            Profile
          </span>

          {/* Dropdown */}
          {dropdownVisible && (
            <div className="absolute top-12 right-0 bg-white border border-gray-200 rounded-lg shadow-lg p-4 w-64">
              <div className="text-gray-800 font-semibold mb-2">
                {studentDetails.name || "Loading..."}
              </div>
              <div className="text-gray-600 text-sm mb-1">
                Email: {studentDetails.email || "Loading..."}
              </div>
              <div className="text-gray-600 text-sm mb-3">
                Branch: {studentDetails.branch || "Loading..."}
              </div>
              <button
                onClick={handleLogout}
                className="w-full bg-red-500 text-white py-2 rounded-lg hover:bg-red-600 transition"
              >
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Nbar;

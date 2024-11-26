import { faBars, faBullhorn, faHome, faMessage, faSignOut, faUserFriends } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import axios from 'axios';
import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import profilePic from '../images/profile.png';
import collegelogo from '../images/rvlogo.png';
import Announcement from '../pages/Announcement'; // Import Announcement component
import Messages from '../pages/Messages'; // Import Messages component
import Team from '../pages/TeamPage'; // Import the Team component
import Home from './Home';
import './NavbarStyle.css';

const Navbar = () => {
  const [dropdownVisible, setDropdownVisible] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false); // State to toggle sidebar visibility
  const [activePage, setActivePage] = useState('home'); // Track active page
  const [loading, setLoading] = useState(false); // Loading state to clear the swapset
  const [studentDetails, setStudentDetails] = useState({
    name: '',
    email: '',
    branch: ''
  });
  const navigate = useNavigate();
  const navbarRef = useRef(null);

  useEffect(() => {
    const fetchStudentDetails = async () => {
      try {
        const token = localStorage.getItem('token');
        const email = localStorage.getItem('userEmail');
        const response = await axios.get(`http://localhost:5000/student-details?email=${email}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        setStudentDetails({
          name: response.data.name,
          email: response.data.email,
          branch: response.data.branch
        });
      } catch (error) {
        console.error('Error fetching student details:', error);
      }
    };
  
    fetchStudentDetails();
  }, []);

  const handleMouseEnter = () => setDropdownVisible(true);
  const handleMouseLeave = () => setDropdownVisible(false);
  const toggleDropdown = () => {
    setDropdownVisible(!dropdownVisible);
  };

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen); // Toggle sidebar state
  };

  const setPage = (page) => {
    setLoading(true); // Set loading to true to clear the content
    setTimeout(() => {
      setActivePage(page); // Update the active page after a brief delay
      setLoading(false); // Reset loading state
    }, 300); // Wait for 300ms to simulate a page transition effect
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  return (
    <div className="navvv">
      <div className="dash">
        <div className="mainbox">
          <div className="top-container">
            {/* 3-dot button to toggle sidebar */}
            <button className="dot3" onClick={toggleSidebar}>
              <FontAwesomeIcon icon={faBars} />
            </button>
            <div className="college">
              <img src={collegelogo} alt="College Logo" className="logo" />
              <span className="name">RV College of Engineering</span>
            </div>

            <div
              className="profile"
              onMouseEnter={handleMouseEnter}
              onMouseLeave={handleMouseLeave}
            >
              <img src={profilePic} alt="Profile" className="profile-image" />
              <span className="profile-name">Profile</span>

              {dropdownVisible && (
                <div className="dropdown">
                  <p className="user-info">Name: {studentDetails.name}</p>
                  <p className="user-email">Email: {studentDetails.email}</p>
                  <p className="user-email">Branch: {studentDetails.branch}</p>
                </div>
              )}
            </div>
          </div>

          {/* Conditionally render the active page */}
          <div className='swapset'>
            {loading ? <div className="loading">Loading...</div> : null}
            {!loading && activePage === 'home' && <Home />}
            {!loading && activePage === 'team' && <Team />}
            {!loading && activePage === 'announcement' && <Announcement />}
            {!loading && activePage === 'messages' && <Messages />}
          </div>
        </div>

        {/* Sidebar with conditional class */}
        <div className={`navbar ${sidebarOpen ? "open" : ""}`} ref={navbarRef}>
          <div className="sidebar">
            <div className="nav-item">
              <a href="#" onClick={() => setPage('home')}>
                <FontAwesomeIcon icon={faHome} />
                <span>Home</span>
              </a>
            </div>
            <div className="nav-item">
              <a href="#" onClick={() => setPage('team')}>
                <FontAwesomeIcon icon={faUserFriends} />
                <span>Team</span>
              </a>
            </div>
            <div className="nav-item">
              <a href="#" onClick={() => setPage('announcement')}>
                <FontAwesomeIcon icon={faBullhorn} />
                <span>Announcement</span>
              </a>
            </div>
            <div className="nav-item">
              <a href="#" onClick={() => setPage('messages')}>
                <FontAwesomeIcon icon={faMessage} />
                <span>Messages</span>
              </a>
            </div>
            <div className="nav-item">
              <div className="logout" onClick={handleLogout}>
                <a href="#">
                  <FontAwesomeIcon icon={faSignOut} />
                  <span>Logout</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Navbar;

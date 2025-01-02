import { faBars, faBullhorn, faHome, faMessage, faSignOutAlt, faUserFriends, faClipboardCheck } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import axios from 'axios';
import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import profilePic from '../images/profile.png';
import collegelogo from '../images/rvlogo.png';
import Announcement from '../pages/Students/Announcement';
import Messages from '../pages/Students/Messages';
import Team from '../pages/Students/TeamPage';
import Home from './Home';
import FeedbackSection from './student/FeedbackSection';
import './NavbarStyle.css';

const Navbar = () => {
  const [dropdownVisible, setDropdownVisible] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activePage, setActivePage] = useState('home');
  const [loading, setLoading] = useState(false);
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
          name: response.data.Name,
          email: response.data.email,
          branch: response.data.departmentCode
        });
      } catch (error) {
        console.error('Error fetching student details:', error);
      }
    };
  
    fetchStudentDetails();
  }, []);

  const handleMouseEnter = () => setDropdownVisible(true);
  const handleMouseLeave = () => setDropdownVisible(false);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const setPage = (page) => {
    setLoading(true);
    setTimeout(() => {
      setActivePage(page);
      setLoading(false);
    }, 300);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (navbarRef.current && !navbarRef.current.contains(event.target)) {
        setSidebarOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="navvv">
      <div className="dash">
        <div className="mainbox">
          <div className="top-container">
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

          <div className='swapset'>
            {loading ? <div className="loading">Loading...</div> : null}
            {!loading && activePage === 'home' && <Home />}
            {!loading && activePage === 'team' && <Team />}
            {!loading && activePage === 'announcement' && <Announcement />}
            {!loading && activePage === 'messages' && <Messages />}
            {!loading && activePage === 'feedback' && <FeedbackSection />}
          </div>
        </div>

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
              <a href="#" onClick={() => setPage('feedback')}>
                <FontAwesomeIcon icon={faClipboardCheck} />
                <span>Feedback</span>
              </a>
            </div>
            <div className="nav-item">
              <div className="logout" onClick={handleLogout}>
                <a href="#">
                  <FontAwesomeIcon icon={faSignOutAlt} />
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

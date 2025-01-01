import React from 'react';
import { motion } from 'framer-motion';
import Navigation from './Navigation';
import PortalButton from './Portalbutton';
import './style.css';
import { FaUserGraduate, FaChalkboardTeacher, FaUserCog, FaUsers, FaClipboardCheck, FaCogs } from 'react-icons/fa';

const LandingPage = () => {
  const fadeIn = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6 }
  };

  const teamMembers = [
    { name: 'Vaibhav P Roddappanavar', id: '1RV23CS278', branch: 'CS' },
    { name: 'Tallam Sri Sai Subramanyam', id: '1RV23CS265', branch: 'CS' },
    { name: 'Chethohaar J M', id: '1RV23CY016', branch: 'CY' },
    { name: 'Nikhil V P', id: '1RV23CY036', branch: 'CY' }
  ];

  return (
    <div className="landing-page">
      <Navigation />
      
      <motion.section 
        id="home"
        className="hero-section"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1 }}
      >
        <motion.h1 
          {...fadeIn}
          transition={{ delay: 0.2 }}
        >
          EL Management Platform
        </motion.h1>
        <motion.p 
          {...fadeIn}
          transition={{ delay: 0.4 }}
          className="hero-subtitle"
        >
          Connect, collaborate, and succeed together in a unified platform designed for academic excellence.
        </motion.p>

        <motion.div 
          className="hero-portal-buttons"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <PortalButton 
            title="Student Portal" 
            icon={<FaUserGraduate />} 
            path="/login"
            delay={0.2}
          />
          <PortalButton 
            title="Teacher Portal" 
            icon={<FaChalkboardTeacher />} 
            path="/teacher/login"
            delay={0.4}
          />
          <PortalButton 
            title="Admin Portal" 
            icon={<FaUserCog />} 
            path="/admin/login"
            delay={0.6}
          />
        </motion.div>
      </motion.section>

      <motion.section 
        id="problems"
        className="problems-section"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
      >
        <h2>Problems We Solve</h2>
        <div className="problem-cards">
          <motion.div 
            className="problem-card"
            whileHover={{ scale: 1.05 }}
          >
            <FaUsers className="card-icon" />
            <h3>For Students</h3>
            <p>Streamlined team formation and management, real-time collaboration tools, and progress tracking capabilities.</p>
          </motion.div>
          
          <motion.div 
            className="problem-card"
            whileHover={{ scale: 1.05 }}
          >
            <FaClipboardCheck className="card-icon" />
            <h3>For Teachers</h3>
            <p>Comprehensive student management, evaluation tools, and mentoring capabilities to enhance academic guidance.</p>
          </motion.div>
          
          <motion.div 
            className="problem-card"
            whileHover={{ scale: 1.05 }}
          >
            <FaCogs className="card-icon" />
            <h3>For Admins</h3>
            <p>Efficient management of students, teachers, and team assignments with powerful administrative tools.</p>
          </motion.div>
        </div>
      </motion.section>

      <motion.section 
        id="about"
        className="about-section"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
      >
        <h2>About Us</h2>
        <div className="team-members">
          {teamMembers.map((member, index) => (
            <motion.div 
              key={member.id}
              className="team-member"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 * index }}
              whileHover={{ scale: 1.05 }}
            >
              <div className="member-avatar">
                {member.name.charAt(0)}
              </div>
              <h3>{member.name}</h3>
              <p>{member.branch} - {member.id}</p>
            </motion.div>
          ))}
        </div>
      </motion.section>
    </div>
  );
};

export default LandingPage;

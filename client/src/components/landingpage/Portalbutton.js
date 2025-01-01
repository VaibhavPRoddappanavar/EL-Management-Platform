import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import './style.css';

const PortalButton = ({ title, icon, path, delay }) => {
  const navigate = useNavigate();

  return (
    <motion.div
      className="portal-button"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      onClick={() => navigate(path)}
    >
      <div className="portal-icon">
        {icon}
      </div>
      <h3>{title}</h3>
      <motion.div 
        className="portal-overlay"
        initial={{ opacity: 0 }}
        whileHover={{ opacity: 1 }}
      >
        <span>Enter {title} →</span>
      </motion.div>
    </motion.div>
  );
};

export default PortalButton;

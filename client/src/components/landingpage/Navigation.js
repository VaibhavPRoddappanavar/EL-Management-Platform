import { motion } from 'framer-motion';
import React, { useEffect, useState } from 'react';
import RVCE from '../../images/RVCE.png'
import './style.css';

const Navigation = () => {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const isScrolled = window.scrollY > 20;
      if (isScrolled !== scrolled) {
        setScrolled(isScrolled);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [scrolled]);

  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId);
    element?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <motion.nav 
      className={`navigation ${scrolled ? 'scrolled' : ''}`}
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="nav-content">
        <motion.div 
          className="logo-container"
          whileHover={{ scale: 1.05 }}
          onClick={() => scrollToSection('home')}
        >
          <img src={RVCE} alt="RV Logo" className="rv-logo" />
          <span className="logo-text">ELink</span>
        </motion.div>
        <div className="nav-links">
          <motion.a 
            onClick={() => scrollToSection('home')}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
          >
            Home
          </motion.a>
          <motion.a 
            onClick={() => scrollToSection('problems')}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
          >
            Problems We Solve
          </motion.a>
          <motion.a 
            onClick={() => scrollToSection('about')}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
          >
            About Us
          </motion.a>
        </div>
      </div>
    </motion.nav>
  );
};

export default Navigation;

import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './home.css';
import RippleBackground from './RippleBackground';

import animVideo from '../images/anim.mp4';

const Home = () => {
  const [displayText, setDisplayText] = useState('');
  const [nameText, setNameText] = useState('');
  const [isTypingComplete, setIsTypingComplete] = useState(false);
  const [isNameComplete, setIsNameComplete] = useState(false);
  const [studentName, setStudentName] = useState('');

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
        setStudentName(response.data.Name);
      } catch (error) {
        console.error('Error fetching student details:', error);
      }
    };
    fetchStudentDetails();
  }, []);

  const title = "Welcome to Your Team";
  const studentNameLine = studentName;

  let index = 0;
  let typingTimeout;
  let thirdIndex = 0;
  let thirdTypingTimeout;

  const typeLetter = () => {
    if (index <= title.length) {
      setDisplayText(title.slice(0, index) + (index > 0 ? "_" : ""));
      index++;
      typingTimeout = setTimeout(typeLetter, 100);
    } else {
      setIsTypingComplete(true);
      clearTimeout(typingTimeout);
      typeNameLetter();
    }
  };

  const typeNameLetter = () => {
    if (thirdIndex <= studentNameLine.length) {
      setNameText(studentNameLine.slice(0, thirdIndex) + (thirdIndex > 0 ? "_" : ""));
      thirdIndex++;
      thirdTypingTimeout = setTimeout(typeNameLetter, 100);
    } else {
      setIsNameComplete(true);
      clearTimeout(thirdTypingTimeout);
    }
  };

  useEffect(() => {
    typeLetter();
    return () => {
      if (typingTimeout) clearTimeout(typingTimeout);
      if (thirdTypingTimeout) clearTimeout(thirdTypingTimeout);
    };
  }, [studentName]);

  return (
    <div className='middle-section'>
      <div className='partition1'>
        <div className="typing-animation">
          <h2 style={{ marginBottom: '0.2em' }}>{isTypingComplete ? title : displayText}</h2>
          <h2 style={{ color: '#457ee0', marginTop: '0.2em' }}>{isNameComplete ? studentNameLine : nameText}</h2>
        </div>
      </div>
      <div className='video-block'>
        <video autoPlay loop muted>
          <source src={animVideo} type="video/mp4" />
          Your browser does not support the video tag.
        </video>
      </div>
      <div>
        <RippleBackground></RippleBackground>
      </div>
    </div>
  );
};

export default Home;

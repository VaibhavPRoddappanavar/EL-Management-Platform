import React, { useEffect, useState } from 'react';
import './home.css';
import RippleBackground from './RippleBackground';

import animVideo from '../images/anim.mp4';

const Home = () => {
  const [displayText, setDisplayText] = useState('');
  const [finalText, setFinalText] = useState('');
  const [isTypingComplete, setIsTypingComplete] = useState(false);
  const [isSecondAnimationComplete, setIsSecondAnimationComplete] = useState(false);

  const title = "Welcome to Your Team";
  const subtitle = "Experiential learning";

  let index = 0;
  let typingTimeout;
  let secondIndex = 0;
  let secondTypingTimeout;

  const typeLetter = () => {
    if (index <= title.length) {
      setDisplayText(title.slice(0, index) + (index > 0 ? "_" : ""));
      index++;
      typingTimeout = setTimeout(typeLetter, 100);
    } else {
      setIsTypingComplete(true);
      clearTimeout(typingTimeout);
      startSecondAnimation();
    }
  };

  const startSecondAnimation = () => {
    if (secondIndex <= subtitle.length) {
      setFinalText(subtitle.slice(0, secondIndex) + (secondIndex > 0 ? "_" : ""));
      secondIndex++;
      secondTypingTimeout = setTimeout(startSecondAnimation, 100);
    } else {
      setIsSecondAnimationComplete(true);
      clearTimeout(secondTypingTimeout);
    }
  };

  useEffect(() => {
    typeLetter();
    return () => {
      if (typingTimeout) clearTimeout(typingTimeout);
      if (secondTypingTimeout) clearTimeout(secondTypingTimeout);
    };
  }, []);

  return (

    
 
    <div className='middle-section'>
      
      <div className='partition1'>


        <div className="typing-animation">
          <h2>{isTypingComplete ? title : displayText}</h2>
          <h1>{isSecondAnimationComplete ? subtitle : finalText}</h1>
        </div>
        <span className="announce">Recent Announcement</span>
        <span className="announce1">Date of First round of evaluation: 23 Nov 2024</span>
       
      </div>

      {/* Video Block */}
      <div className='video-block'>
        <video autoPlay loop muted>
          <source src={animVideo} type="video/mp4" />
          Your browser does not support the video tag.
        </video>
      </div>
      <div>
    <RippleBackground />
      </div>
      
    </div>

  );
};

export default Home;

// SignInSignUp.js
import React, { useState } from 'react';
import '../style.css';
import LoginPage from './LoginPage';
import SignUpPage from './SignUpPage';

function SignInSignUp() {
  const [isSignUpActive, setIsSignUpActive] = useState(false);

  const handleToggle = () => {
    setIsSignUpActive(!isSignUpActive);
  };

  return (
    <div className={`container ${isSignUpActive ? "sign-up-mode" : ""}`}>
      <div className="forms-container">
        <div className="signin-signup">
          <LoginPage />
          <SignUpPage />
        </div>
      </div>

      <div className="panels-container">
        <div className={`panel left-panel ${isSignUpActive ? "" : "active-panel"}`}>
          <div className="content">
            <h3>New here?</h3>
            <p>Sign up to join the community and unlock exciting features.</p>
            <button onClick={handleToggle} className="btn transparent" id="sign-up-btn">
              Sign Up
            </button>
          </div>
        </div>
        <div className={`panel right-panel ${isSignUpActive ? "active-panel" : ""}`}>
          <div className="content">
            <h3>Already have an account?</h3>
            <p>Sign in to continue exploring your personalized content.</p>
            <button onClick={handleToggle} className="btn transparent" id="sign-in-btn">
              Sign In
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SignInSignUp;

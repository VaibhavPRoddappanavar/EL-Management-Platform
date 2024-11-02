// ForgotPasswordPage.js
import axios from 'axios';
import React, { useState } from 'react';
import '../style.css'; // Ensure this imports the main styles

function ForgotPasswordPage() {
  const [email, setEmail] = useState('');

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:5000/Password/forgot-password', { email });
      alert('Password reset email sent.');
    } catch (error) {
      alert(error.response.data.message);
    }
  };

  return (
    <div className="forgot-password-container">
      <div className="form-box">
        <h2>Forgot Password</h2>
        <p>Please enter your email address to receive a password reset link.</p>
        <form onSubmit={handleForgotPassword}>
          <div className="fpinput-field">
            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <button type="submit" className="btn">Send Link</button>
        </form>
      </div>
    </div>
  );
}

export default ForgotPasswordPage;

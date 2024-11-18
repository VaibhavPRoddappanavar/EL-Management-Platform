import axios from 'axios';
import React, { useState } from 'react';
import { FaEnvelope, FaLock } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
//import "./style.css";


function SignUpPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const navigate = useNavigate();

  const handleSignUp = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:5000/student/register', { email, password, confirmPassword });
      alert('Registration successful! Please log in.');
      navigate('/login');
    } catch (error) {
      alert(error.response?.data?.message || 'Sign-up failed. Please try again.');
    }
  };

  return (
    <form onSubmit={handleSignUp} className="sign-up-form">
      <h2 className="title">Sign Up</h2>
       <div className="input-field">
       <FaEnvelope className="icon" /> {/* Envelope Icon */}
      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
      /></div>
      <div className="input-field">
      <FaLock className="icon" /> {/* Lock Icon */}
      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
      /></div>
      <div className="input-field">
      <FaLock className="icon" /> {/* Lock Icon for Confirm Password */}
      <input
        type="password"
        placeholder="Confirm Password"
        value={confirmPassword}
        onChange={(e) => setConfirmPassword(e.target.value)}
        required
      /></div>
      <button type="submit" className="btn">Sign Up</button>
    </form>
  );
}

export default SignUpPage;

import axios from 'axios';
import React, { useState } from 'react';
import { FaEnvelope, FaLock } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import "../style.css";

function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://localhost:5000/student/login', { email, password });
      localStorage.setItem('token', response.data.token);
      if (response.data.teamExists) {
        navigate('/team');
      } else {
        navigate('/create-team');
      }
    } catch (error) {
      alert(error.response?.data?.message || 'Login failed. Please try again.');
    }
  };

  return (
    <form onSubmit={handleLogin} className="sign-in-form">
      <h2 className="title">Sign in</h2>
      <div className="input-field">
      <FaEnvelope className="icon" />
      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
      /></div>
      <div className="input-field">
      <FaLock className="icon" />
      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
      /></div>
      <button type="submit" className="btn solid">Login</button>
      <button className="forgotPass" onClick={() => navigate('/forgot-password')}>Forgot Password</button>
      {/* <div className="auth-links">
        <button className="btn solid" onClick={() => navigate('/signup')}>Sign Up</button>
        <button className="btn solid" onClick={() => navigate('/forgot-password')}>Forgot Password</button>
      </div> */}
    </form>
  );
}

export default LoginPage;

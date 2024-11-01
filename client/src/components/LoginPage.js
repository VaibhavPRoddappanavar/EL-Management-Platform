import axios from 'axios';
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://localhost:5000/student/login', { email, password });
      localStorage.setItem('token', response.data.token);
      
      // Check if the user is part of a team and navigate accordingly
      if (response.data.teamExists) {
        navigate('/team');  // Go to team page if part of a team
      } else {
        navigate('/create-team');  // Redirect to create team page if not in a team
      }
    } catch (error) {
      alert(error.response?.data?.message || 'Login failed. Please try again.');
    }
  };

  return (
    <div>
      <h2>Login</h2>
      <form onSubmit={handleLogin}>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button type="submit">Login</button>
      </form>
      <button onClick={() => navigate('/signup')}>Sign Up</button>
      <button onClick={() => navigate('/forgot-password')}>Forgot Password</button>
    </div>
  );
}

export default LoginPage;

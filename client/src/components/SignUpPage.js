import axios from 'axios';
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function SignUpPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const navigate = useNavigate(); // Initialize useNavigate

  const handleSignUp = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:5000/student/register', { name, email, password, confirmPassword });
      alert('Registration successful! Please log in.');
      navigate('/login'); // Redirect to the login page
    } catch (error) {
      alert(error.response.data.message);
    }
  };

  return (
    <div>
      <h2>Sign Up</h2>
      <form onSubmit={handleSignUp}>
        <input type="text" placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} />
        <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
        <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} />
        <input type="password" placeholder="Confirm Password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
        <button type="submit">Sign Up</button>
      </form>
    </div>
  );
}

export default SignUpPage;

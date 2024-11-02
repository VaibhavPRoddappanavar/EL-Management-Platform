import axios from 'axios';
import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import '../style.css'; // Import the main styles

function ResetPasswordPage() {
  const { token } = useParams();
  const navigate = useNavigate();
  const [newPassword, setNewPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      // Adjust the URL to point to the backend server
      const response = await axios.post(`http://localhost:5000/Password/reset-password/${token}`, { newPassword });
      setSuccess(response.data.message);
      // Optionally redirect after a delay
      setTimeout(() => navigate('/login'), 2000);
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong!');
    }
  };

  return (
    <div className="forgot-password-container">
      <div className="form-box">
        <h2>Reset Password</h2>
        <p>Please enter your new password to reset it.</p>
        <form onSubmit={handleSubmit}>
          <div className="fpinput-field">
            <input
              type="password"
              placeholder="Enter your new password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
            />
          </div>
          <button type="submit" className="btn">Reset</button>
        </form>
        {error && <p className="error-text">{error}</p>}
        {success && <p className="success-text">{success}</p>}
      </div>
    </div>
  );
}

export default ResetPasswordPage;

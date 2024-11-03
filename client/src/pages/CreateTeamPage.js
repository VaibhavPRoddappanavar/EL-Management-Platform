import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

function CreateTeamPage() {
  const [formData, setFormData] = useState({
    TeamLeaderUSN: '',
    TeamLeaderName: '',
    TeamleaderEmailID: '',
    TeamleaderMobileNumber: '',
    TeamleaderProgram: '',
    Theme: '',
    Teammember1USN: '',
    TeamMember1Name: '',
    TeamMember1EmailID: '',
    TeamMember1MobileNumber: '',
    TeamMember1Program: '',
    Teammember2USN: '',
    TeamMember2Name: '',
    TeamMember2EmailId: '',
    TeamMember2MobileNumber: '',
    TeamMember2Program: '',
    Teammember3USN: '',
    TeamMember3Name: '',
    TeamMember3EmailID: '',
    TeamMember3MobileNumber: '',
    TeamMember3Program: '',
    Teammember4USN: '',
    TeamMember4Name: '',
    TeamMember4EmailID: '',
    TeamMember4MobileNumber: '',
    TeamMember4Program: ''
  });

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect to login if no token is found
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login'); // redirect to login page
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      const response = await axios.post('/team/create-team', formData, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      setSuccess(response.data.message);
      setFormData({
        TeamLeaderUSN: '',
        TeamLeaderName: '',
        TeamleaderEmailID: '',
        TeamleaderMobileNumber: '',
        TeamleaderProgram: '',
        Theme: '',
        Teammember1USN: '',
        TeamMember1Name: '',
        TeamMember1EmailID: '',
        TeamMember1MobileNumber: '',
        TeamMember1Program: '',
        Teammember2USN: '',
        TeamMember2Name: '',
        TeamMember2EmailId: '',
        TeamMember2MobileNumber: '',
        TeamMember2Program: '',
        Teammember3USN: '',
        TeamMember3Name: '',
        TeamMember3EmailID: '',
        TeamMember3MobileNumber: '',
        TeamMember3Program: '',
        Teammember4USN: '',
        TeamMember4Name: '',
        TeamMember4EmailID: '',
        TeamMember4MobileNumber: '',
        TeamMember4Program: ''
      });
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong!');
    }
  };

  return (
    <div>
      <h2>Create Team</h2>
      <form onSubmit={handleSubmit}>
        
        {/* Team Leader Section */}
        <div className="team-leader-box">
          <h3>Team Leader Information</h3>
          <div>
            <label>Team Leader USN:</label>
            <input type="text" name="TeamLeaderUSN" value={formData.TeamLeaderUSN} onChange={handleChange} required />
          </div>
          <div>
            <label>Team Leader Name:</label>
            <input type="text" name="TeamLeaderName" value={formData.TeamLeaderName} onChange={handleChange} required />
          </div>
          <div>
            <label>Team Leader Email:</label>
            <input type="email" name="TeamleaderEmailID" value={formData.TeamleaderEmailID} onChange={handleChange} required />
          </div>
          <div>
            <label>Team Leader Mobile Number:</label>
            <input type="text" name="TeamleaderMobileNumber" value={formData.TeamleaderMobileNumber} onChange={handleChange} required />
          </div>
          <div>
            <label>Team Leader Program:</label>
            <input type="text" name="TeamleaderProgram" value={formData.TeamleaderProgram} onChange={handleChange} required />
          </div>
          <div>
            <label>Team Theme:</label>
            <input type="text" name="Theme" value={formData.Theme} onChange={handleChange} required />
          </div>
        </div>

        {/* Team Member Sections */}
        <div className="team-member-container">
          {[1, 2, 3, 4].map((num) => (
            <div key={num} className="team-member-box">
              <h3>Team Member {num} Information</h3>
              <div>
                <label>Team Member {num} USN:</label>
                <input type="text" name={`Teammember${num}USN`} value={formData[`Teammember${num}USN`]} onChange={handleChange} />
              </div>
              <div>
                <label>Team Member {num} Name:</label>
                <input type="text" name={`TeamMember${num}Name`} value={formData[`TeamMember${num}Name`]} onChange={handleChange} />
              </div>
              <div>
                <label>Team Member {num} Email:</label>
                <input type="email" name={`TeamMember${num}EmailID`} value={formData[`TeamMember${num}EmailID`]} onChange={handleChange} />
              </div>
              <div>
                <label>Team Member {num} Mobile Number:</label>
                <input type="text" name={`TeamMember${num}MobileNumber`} value={formData[`TeamMember${num}MobileNumber`]} onChange={handleChange} />
              </div>
              <div>
                <label>Team Member {num} Program:</label>
                <input type="text" name={`TeamMember${num}Program`} value={formData[`TeamMember${num}Program`]} onChange={handleChange} />
              </div>
            </div>
          ))}
        </div>

        <button type="submit">Create Team</button>
        <button onClick={handleLogout}>Logout</button>
        {error && <p className="error">{error}</p>}
        {success && <p className="success">{success}</p>}
      </form>
    </div>
  );
}

export default CreateTeamPage;

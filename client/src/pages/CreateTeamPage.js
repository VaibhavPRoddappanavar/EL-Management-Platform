// CreateTeamPage.js
import axios from 'axios';
import React, { useState } from 'react';

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

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      const response = await axios.post('/api/create-team', formData, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      setSuccess(response.data.message);
      // Optionally reset form or redirect
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

        <h3>Team Member 1 Information</h3>
        <div>
          <label>Team Member 1 USN:</label>
          <input type="text" name="Teammember1USN" value={formData.Teammember1USN} onChange={handleChange} required />
        </div>
        <div>
          <label>Team Member 1 Name:</label>
          <input type="text" name="TeamMember1Name" value={formData.TeamMember1Name} onChange={handleChange} required />
        </div>
        <div>
          <label>Team Member 1 Email:</label>
          <input type="email" name="TeamMember1EmailID" value={formData.TeamMember1EmailID} onChange={handleChange} required />
        </div>
        <div>
          <label>Team Member 1 Mobile Number:</label>
          <input type="text" name="TeamMember1MobileNumber" value={formData.TeamMember1MobileNumber} onChange={handleChange} required />
        </div>
        <div>
          <label>Team Member 1 Program:</label>
          <input type="text" name="TeamMember1Program" value={formData.TeamMember1Program} onChange={handleChange} required />
        </div>

        <h3>Team Member 2 Information</h3>
        <div>
          <label>Team Member 2 USN:</label>
          <input type="text" name="Teammember2USN" value={formData.Teammember2USN} onChange={handleChange} />
        </div>
        <div>
          <label>Team Member 2 Name:</label>
          <input type="text" name="TeamMember2Name" value={formData.TeamMember2Name} onChange={handleChange} />
        </div>
        <div>
          <label>Team Member 2 Email:</label>
          <input type="email" name="TeamMember2EmailId" value={formData.TeamMember2EmailId} onChange={handleChange} />
        </div>
        <div>
          <label>Team Member 2 Mobile Number:</label>
          <input type="text" name="TeamMember2MobileNumber" value={formData.TeamMember2MobileNumber} onChange={handleChange} />
        </div>
        <div>
          <label>Team Member 2 Program:</label>
          <input type="text" name="TeamMember2Program" value={formData.TeamMember2Program} onChange={handleChange} />
        </div>

        <h3>Team Member 3 Information</h3>
        <div>
          <label>Team Member 3 USN:</label>
          <input type="text" name="Teammember3USN" value={formData.Teammember3USN} onChange={handleChange} />
        </div>
        <div>
          <label>Team Member 3 Name:</label>
          <input type="text" name="TeamMember3Name" value={formData.TeamMember3Name} onChange={handleChange} />
        </div>
        <div>
          <label>Team Member 3 Email:</label>
          <input type="email" name="TeamMember3EmailID" value={formData.TeamMember3EmailID} onChange={handleChange} />
        </div>
        <div>
          <label>Team Member 3 Mobile Number:</label>
          <input type="text" name="TeamMember3MobileNumber" value={formData.TeamMember3MobileNumber} onChange={handleChange} />
        </div>
        <div>
          <label>Team Member 3 Program:</label>
          <input type="text" name="TeamMember3Program" value={formData.TeamMember3Program} onChange={handleChange} />
        </div>

        <h3>Team Member 4 Information</h3>
        <div>
          <label>Team Member 4 USN:</label>
          <input type="text" name="Teammember4USN" value={formData.Teammember4USN} onChange={handleChange} />
        </div>
        <div>
          <label>Team Member 4 Name:</label>
          <input type="text" name="TeamMember4Name" value={formData.TeamMember4Name} onChange={handleChange} />
        </div>
        <div>
          <label>Team Member 4 Email:</label>
          <input type="email" name="TeamMember4EmailID" value={formData.TeamMember4EmailID} onChange={handleChange} />
        </div>
        <div>
          <label>Team Member 4 Mobile Number:</label>
          <input type="text" name="TeamMember4MobileNumber" value={formData.TeamMember4MobileNumber} onChange={handleChange} />
        </div>
        <div>
          <label>Team Member 4 Program:</label>
          <input type="text" name="TeamMember4Program" value={formData.TeamMember4Program} onChange={handleChange} />
        </div>

        <button type="submit">Create Team</button>

        {error && <p style={{ color: 'red' }}>{error}</p>}
        {success && <p style={{ color: 'green' }}>{success}</p>}
      </form>
    </div>
  );
}

export default CreateTeamPage;

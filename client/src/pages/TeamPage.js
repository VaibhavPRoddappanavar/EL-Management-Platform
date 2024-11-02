import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

function TeamPage() {
  const [team, setTeam] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchTeam = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get('http://localhost:5000/teams/team-details', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setTeam(response.data.teamDetails);
      } catch (error) {
        if (error.response && error.response.status === 404) {
          navigate('/create-team');
        } else {
          console.error('Failed to fetch team details:', error);
        }
      }
    };
    fetchTeam();
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  if (!team) return <div>Loading...</div>;

  return (
    <div>
      <h2>Welcome to Your Team</h2>
      <h3>Project Theme: {team.theme}</h3>
      <h4><strong>Team Leader:</strong></h4>
      <p>Name: {team.teamLeader.name}</p>
      <p>Email: {team.teamLeader.email}</p>
      <p>Mobile: {team.teamLeader.mobile}</p>
      <p>USN: {team.teamLeader.usn}</p> {/* Display Team Leader USN */}

      <h4>Team Members:</h4>
      {team.teamMembers.map((member, index) => (
        <div key={index} style={{ marginBottom: '1rem' }}>
          <p><strong>Member {index + 1}:</strong></p>
          <p>Name: {member.name}</p>
          <p>Email: {member.email}</p>
          <p>Mobile: {member.mobile}</p>
          <p>Program: {member.program}</p>
          <p>USN: {member.usn}</p> {/* Display USN for each team member */}
        </div>
      ))}
      <button onClick={handleLogout}>Logout</button>
    </div>
  );
}

export default TeamPage;

import axios from "axios";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./TeamPageStyle.css";

function TeamPage() {
  const [team, setTeam] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  // Fetch team details
  useEffect(() => {
    const fetchTeam = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          navigate("/login");
          return;
        }

        const response = await axios.get(
          "http://localhost:5000/team-details",
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        
        if (response.data) {
          setTeam(response.data);
          setError(null);
        }
      } catch (error) {
        console.error("Failed to fetch team details:", error);
        if (error.response?.status === 404) {
          navigate("/create-team");
        } else if (error.response?.status === 401) {
          localStorage.removeItem("token");
          navigate("/login");
        } else {
          setError("Failed to fetch team details. Please try again later.");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchTeam();
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  if (loading) {
    return <div className="loading">Loading team details...</div>;
  }

  if (error) {
    return <div className="error">{error}</div>;
  }

  return (
    <div className="TeamPage">
      <div className="content">
        <h2>My Team</h2>
        <div className="team-cards">
          {/* Team Leader Card */}
          {team?.leader && (
            <div className="leader-card">
              <h3>Team Leader</h3>
              <div className="member-card">
                <p><strong>Name:</strong> {team.leader.name}</p>
                <p><strong>Email:</strong> {team.leader.email}</p>
                <p><strong>USN:</strong> {team.leader.usn}</p>
              </div>
            </div>
          )}

          {/* Team Members Cards */}
          {team?.members && team.members.length > 0 && (
            <div className="members-section">
              <h3>Team Members</h3>
              <div className="members-grid">
                {team.members.map((member, index) => (
                  <div key={index} className="member-card">
                    <p><strong>Name:</strong> {member.name}</p>
                    <p><strong>Email:</strong> {member.email}</p>
                    <p><strong>USN:</strong> {member.usn}</p>
                    <p><strong>Position:</strong> {member.position}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Team Theme */}
          {team?.theme && (
            <div className="theme-section">
              <h3>Team Theme</h3>
              <div className="theme-card">
                <p>{team.theme}</p>
              </div>
            </div>
          )}
        </div>

        <button className="logout-button" onClick={handleLogout}>
          Logout
        </button>
      </div>
    </div>
  );
}

export default TeamPage;

import axios from "axios";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./TeamPageStyle.css";

function TeamPage() {
  const [team, setTeam] = useState(null);

  const [displayText, setDisplayText] = useState(""); // State for the animated text
  const [finalText, setFinalText] = useState(""); // State for the final text without underscores
  const navigate = useNavigate();

  // Fetch team details
  useEffect(() => {
    const fetchTeam = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get(
          "http://localhost:5000/teams/team-details",
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setTeam(response.data.teamDetails);
      } catch (error) {
        if (error.response && error.response.status === 404) {
          navigate("/create-team");
        } else {
          console.error("Failed to fetch team details:", error);
        }
      }
    };
    fetchTeam();
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  return (
    <div className="TeamPage">
      <div className="content">
        <h2>{displayText || finalText}</h2>{" "}
        {/* Display the animated text or final text */}
        <div className="team-cards">
          {/* Team Leader Card */}
          {team && (
            <div className="leader-card">
              <h3>Team Leader</h3>
              <p>
                <strong>Name:</strong> {team.teamLeader.name}
              </p>
              <p>
                <strong>Email:</strong> {team.teamLeader.email}
              </p>
              <p>
                <strong>Mobile:</strong> {team.teamLeader.mobile}
              </p>
              <p>
                <strong>Program:</strong> {team.teamLeader.program}
              </p>
              <p>
                <strong>USN:</strong> {team.teamLeader.usn}
              </p>
            </div>
          )}

          {/* Team Members */}
          {team &&
            team.teamMembers.map((member, index) => (
              <div key={index} className="member-card">
                <h3>Team Member {index + 1}</h3>
                <p>
                  <strong>Name:</strong> {member.name}
                </p>
                <p>
                  <strong>Email:</strong> {member.email}
                </p>
                <p>
                  <strong>Mobile:</strong> {member.mobile}
                </p>
                <p>
                  <strong>Program:</strong> {member.program}
                </p>
                <p>
                  <strong>USN:</strong> {member.usn}
                </p>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
}

export default TeamPage;

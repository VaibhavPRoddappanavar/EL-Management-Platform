import axios from "axios";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import Chat from "../components/Team/Chat";

function TeamPage() {
  const [team, setTeam] = useState(null);

  const [studentDetails, setStudentDetails] = useState({
    name: "",
    email: "",
    branch: "",
  });
  const [displayText, setDisplayText] = useState(""); // State for the animated text
  const [finalText, setFinalText] = useState(""); // State for the final text without underscores
  const navigate = useNavigate();

  // Fetch student details
  useEffect(() => {
    const fetchStudentDetails = async () => {
      try {
        const token = localStorage.getItem("token");
        const email = localStorage.getItem("userEmail");
        const response = await axios.get(
          `http://localhost:5000/student-details?email=${email}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        setStudentDetails({
          name: response.data.name,
          email: response.data.email,
          branch: response.data.branch,
        });
      } catch (error) {
        console.error("Error fetching student details:", error);
      }
    };

    fetchStudentDetails();
  }, []);

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
    <div>
      {/* Conditionally render Chat component only if team data is available */}

      {team && <Chat teamId={team.teamId} userName={studentDetails.name} />}
      {/* design this page further */}
    </div>
  );
}

export default TeamPage;

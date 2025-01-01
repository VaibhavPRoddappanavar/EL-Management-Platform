import axios from "axios";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Chat from "../../components/Team/Chat";

function Messages() {
  const [team, setTeam] = useState(null);
  const [studentDetails, setStudentDetails] = useState({
    name: "",
    email: "",
    branch: "",
  });
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
          name: response.data.Name || "",
          email: response.data.email || "",
          branch: response.data.departmentCode || "",
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
        
        if (response.data && response.data.teamDetails) {
          // Ensure we have the correct team ID
          const teamData = response.data.teamDetails;
          setTeam({
            ...teamData,
            teamId: teamData._id || teamData.teamId // Use _id if available, fallback to teamId
          });
        }
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

  // Only render Chat if we have both team ID and student name
  const canRenderChat = team && team.teamId && studentDetails && studentDetails.name;

  return (
    <div className="messages-container">
      {canRenderChat ? (
        <Chat 
          teamId={team.teamId} 
          userName={studentDetails.name} 
        />
      ) : (
        <div className="loading-message">
          Loading chat... Please wait.
        </div>
      )}
    </div>
  );
}

export default Messages;

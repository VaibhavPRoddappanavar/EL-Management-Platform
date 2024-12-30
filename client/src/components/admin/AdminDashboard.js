import { Box, Container, Paper, Tab, Tabs } from "@mui/material";
import axios from "axios";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
// import NotInTeam from "../Admin/NotInTeam";
import "./AdminDashboard.css";
import TeacherManagement from "./TeacherManagement/TeacherManagement";
import UnassignedStudents from './UnassignedStudents';
import StudentMarks from './StudentMarks';

function AdminDashboard() {
  // Existing state
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedTheme, setSelectedTheme] = useState("");
  const [searchType, setSearchType] = useState("Name");
  const [searchTerm, setSearchTerm] = useState("");
  
  // New state for tabs
  const [activeTab, setActiveTab] = useState(0);
  const navigate = useNavigate();

  const themes = [
    "All Teams",
    "AI for Social Good",
    "AI in Education",
    "AR, VR & MR",
    "Artificial Intelligence",
    "Cloud Security",
    "Data Science and Analytics",
    "Edge Computing",
    "Ethical AI",
    "Internet of things",
    "Programming Mechanics(coding for App development)",
  ];

  useEffect(() => {
    const token = localStorage.getItem("adminToken");
    if (!token) {
      navigate("/admin/login");
    }
  }, [navigate]);

  // Existing team fetching logic
  const fetchTeams = async (theme) => {
    setLoading(true);
    setSelectedTheme(theme);
    setSearchTerm("");

    try {
      const token = localStorage.getItem("adminToken");
      const url = theme === "All Teams"
        ? `http://localhost:5000/admin/teams`
        : `http://localhost:5000/admin/teams?theme=${encodeURIComponent(theme)}`;

      const response = await axios.get(url, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setTeams(response.data);
    } catch (error) {
      console.error("Failed to fetch teams:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteTeam = async (teamId) => {
    if (!window.confirm("Are you sure you want to delete this team?")) {
      return;
    }

    try {
      const token = localStorage.getItem("adminToken");
      await axios.delete(`http://localhost:5000/admin/teams/${teamId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setTeams((prevTeams) => prevTeams.filter((team) => team._id !== teamId));
      alert("Team deleted successfully!");
    } catch (error) {
      console.error("Failed to delete team:", error);
      alert("Failed to delete team. Please try again.");
    }
  };

  const filteredTeams = teams.filter((team) => {
    const term = searchTerm.toLowerCase();
    if (searchType === "Name") {
      return (
        team.TeamLeaderName.toLowerCase().includes(term) ||
        ["1", "2", "3", "4"].some(
          (member) =>
            team[`TeamMember${member}Name`] &&
            team[`TeamMember${member}Name`].toLowerCase().includes(term)
        )
      );
    } else if (searchType === "USN") {
      return (
        team.TeamLeaderUSN.toLowerCase().includes(term) ||
        ["1", "2", "3", "4"].some(
          (member) =>
            team[`TeamMember${member}USN`] &&
            team[`TeamMember${member}USN`].toLowerCase().includes(term)
        )
      );
    }
    return false;
  });

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const renderTeamManagement = () => (
    <div className="dashboard-container">
      <h2 className="title">Team Management</h2>
      <h3 className="subtitle">Filter by Theme</h3>

      <div className="theme-buttons">
        {themes.map((theme, index) => (
          <button
            key={index}
            onClick={() => fetchTeams(theme)}
            className={`theme-button ${selectedTheme === theme ? "active" : ""}`}
          >
            {theme}
          </button>
        ))}
      </div>

      {selectedTheme && (
        <div>
          <h3 className="total-teams">
            {selectedTheme} - Total Teams: {filteredTeams.length}
          </h3>
          <br />

          <label className="search-label">Search by:</label>
          <select
            value={searchType}
            onChange={(e) => setSearchType(e.target.value)}
            className="search-select"
          >
            <option>Name</option>
            <option>USN</option>
          </select>

          <input
            type="text"
            placeholder={`Search by ${searchType.toLowerCase()}...`}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />

          <div className="teams-list">
            {loading ? (
              <div className="loading">Loading...</div>
            ) : filteredTeams.length === 0 ? (
              <div className="no-teams">No teams found</div>
            ) : (
              filteredTeams.map((team) => (
                <div key={team._id} className="team-card">
                  <h3>{team.TeamName}</h3>
                  <p>Theme: {team.Theme}</p>
                  <div className="team-members">
                    <h4>Team Members:</h4>
                    <ul>
                      <li>
                        Leader: {team.TeamLeaderName} ({team.TeamLeaderUSN})
                      </li>
                      {team.TeamMember1Name && (
                        <li>
                          Member 1: {team.TeamMember1Name} ({team.TeamMember1USN})
                        </li>
                      )}
                      {team.TeamMember2Name && (
                        <li>
                          Member 2: {team.TeamMember2Name} ({team.TeamMember2USN})
                        </li>
                      )}
                      {team.TeamMember3Name && (
                        <li>
                          Member 3: {team.TeamMember3Name} ({team.TeamMember3USN})
                        </li>
                      )}
                      {team.TeamMember4Name && (
                        <li>
                          Member 4: {team.TeamMember4Name} ({team.TeamMember4USN})
                        </li>
                      )}
                    </ul>
                  </div>
                  <button
                    onClick={() => handleDeleteTeam(team._id)}
                    className="delete-button"
                  >
                    Delete Team
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div className="admin-dashboard">
      <Container maxWidth="xl">
        <Paper elevation={3} sx={{ mt: 3, p: 3 }}>
          <Box sx={{ borderBottom: 1, borderColor: "divider", mb: 3 }}>
            <Tabs value={activeTab} onChange={handleTabChange}>
              <Tab label="Teams Overview" />
              <Tab label="Teacher Management" />
              <Tab label="Unassigned Students" />
              <Tab label="Student Marks" />
            </Tabs>
          </Box>

          {activeTab === 0 && renderTeamManagement()}
          {activeTab === 1 && <TeacherManagement />}
          {activeTab === 2 && <UnassignedStudents />}
          {activeTab === 3 && <StudentMarks />}
        </Paper>
      </Container>
    </div>
  );
}

export default AdminDashboard;

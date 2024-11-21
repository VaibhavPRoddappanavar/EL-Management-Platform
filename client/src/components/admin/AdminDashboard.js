import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./AdminDashboard.css";
import UnassignedStudents from "./UnassignedStudents";

function AdminDashboard() {
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedTheme, setSelectedTheme] = useState("");
  const [searchType, setSearchType] = useState("Name");
  const [searchTerm, setSearchTerm] = useState("");
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

  const fetchTeams = async (theme) => {
    setLoading(true);
    setSelectedTheme(theme);
    setSearchTerm("");

    try {
      const token = localStorage.getItem("adminToken");
      const url =
        theme === "All Teams"
          ? `http://localhost:5000/admin/teams`
          : `http://localhost:5000/admin/teams?theme=${encodeURIComponent(
              theme
            )}`;

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

      // Update the UI by removing the deleted team from the state
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

  return (
    <div className="admin-dashboard">
      <UnassignedStudents></UnassignedStudents>
      <div className="dashboard-container">
        <h2 className="title">Admin Dashboard</h2>
        <h3 className="subtitle">Filter by Theme</h3>

        <div className="theme-buttons">
          {themes.map((theme, index) => (
            <button
              key={index}
              onClick={() => fetchTeams(theme)}
              className={`theme-button ${
                selectedTheme === theme ? "active" : ""
              }`}
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
            <br></br>

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
              <h3 className="subtitle">Teams</h3>
              {loading ? (
                <p className="text-center">Loading teams...</p>
              ) : (
                <ul>
                  {filteredTeams.length === 0 ? (
                    <p className="text-center">
                      No teams found for the selected theme or search criteria.
                    </p>
                  ) : (
                    filteredTeams.map((team, index) => (
                      <li key={index} className="team-item">
                        <h4 className="team-title">
                          {index + 1}. {team.TeamLeaderName} (Team-Lead) -{" "}
                          {team.TeamleaderProgram} - {team.TeamLeaderUSN}
                        </h4>

                        <p className="team-info">
                          Email: {team.TeamleaderEmailID} | Mobile:{" "}
                          {team.TeamleaderMobileNumber}
                        </p>
                        <p>Theme: {team.Theme}</p>

                        {/* Team Delete Button */}
                        <div
                          className="delete-team-icon"
                          onClick={() => handleDeleteTeam(team._id)}
                          title="Delete Team"
                        >
                          🗑️
                        </div>

                        <div className="team-members">
                          <p>Team Members:</p>
                          {["1", "2", "3", "4"].map((member) =>
                            team[`TeamMember${member}Name`] ? (
                              <div key={member} className="team-member-info">
                                <p>
                                  {team[`TeamMember${member}Name`]} -{" "}
                                  {team[`TeamMember${member}Program`]} -{" "}
                                  {team[`TeamMember${member}USN`]}
                                </p>
                                <p>
                                  Email: {team[`TeamMember${member}EmailID`]} |
                                  Mobile:{" "}
                                  {team[`TeamMember${member}MobileNumber`]}
                                </p>
                              </div>
                            ) : null
                          )}
                        </div>
                      </li>
                    ))
                  )}
                </ul>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default AdminDashboard;

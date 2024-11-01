import React, { useState } from "react";
import axios from "axios";

function AdminDashboard() {
  const [teams, setTeams] = useState([]);
  const themes = [
    "AI for Social Good",
    "AI in Education",
    "AR, VR & MR",
    "Artificial Intelligence",
    "Cloud Security",
    "Data Science and Analytics",
    "Edge Computing",
    "Ethical AI",
    "Internet of Things",
    "Programming Mechanics(coding for App development)",
  ];

  const fetchTeams = async (theme) => {
    try {
      const token = localStorage.getItem("adminToken");
      const response = await axios.get(
        `http://localhost:5000/admin/teams?theme=${encodeURIComponent(theme)}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setTeams(response.data);
    } catch (error) {
      console.error("Failed to fetch teams:", error);
    }
  };

  return (
    <div className="min-h-screen bg-blue-50 text-gray-800 flex flex-col items-center py-10 px-4">
      <div className="max-w-4xl w-full bg-white shadow-lg rounded-lg p-8">
        <h2 className="text-3xl font-semibold text-center text-blue-700 mb-6">
          Admin Dashboard
        </h2>
        <h3 className="text-xl font-semibold text-gray-700 mb-4">
          Filter by Theme
        </h3>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-8">
          {themes.map((theme, index) => (
            <button
              key={index}
              onClick={() => fetchTeams(theme)}
              className="px-4 py-2 rounded-md font-medium bg-blue-100 text-blue-700 hover:bg-blue-300 focus:ring focus:ring-blue-500"
            >
              {theme}
            </button>
          ))}
        </div>

        <div className="mt-6">
          <h3 className="text-xl font-semibold text-gray-700 mb-4">Teams</h3>
          <ul>
            {teams.length === 0 ? (
              <p className="text-center text-gray-600">
                No teams found for the selected theme.
              </p>
            ) : (
              teams.map((team, index) => (
                <li
                  key={index}
                  className="border border-gray-200 rounded-lg p-4 mb-4 shadow-sm bg-blue-100"
                >
                  <h4 className="text-lg font-semibold text-blue-800 mb-2">
                    {team.TeamLeaderName} (Team-Lead) -{" "}
                    {team[`TeamleaderProgram`]} -{team[`TeamLeaderUSN`]}
                  </h4>

                  <p className="text-gray-500">
                    Email: {team[`TeamleaderEmailID`]} | Mobile:{" "}
                    {team[`TeamleaderMobileNumber`]}
                  </p>

                  {/* no need theme bcoz its already under that filter <p className="text-gray-600 mb-2">Theme: {team.Theme}</p> */}
                  {/* Add more team details as needed */}
                  <div className="text-gray-700 mt-4">
                    <p className="font-medium text-blue-700">Team Members:</p>
                    {["1", "2", "3", "4"].map((member) =>
                      team[`TeamMember${member}Name`] ? (
                        <div key={member} className="ml-4">
                          <p>
                            {team[`TeamMember${member}Name`]} -{" "}
                            {team[`TeamMember${member}Program`]} -
                            {team[`TeamMember3USN`]}
                          </p>
                          <p className="text-gray-500">
                            Email: {team[`TeamMember${member}EmailID`]} |
                            Mobile: {team[`TeamMember${member}MobileNumber`]}
                          </p>
                        </div>
                      ) : null
                    )}
                  </div>
                </li>
              ))
            )}
          </ul>
        </div>
      </div>
    </div>
  );
}

export default AdminDashboard;

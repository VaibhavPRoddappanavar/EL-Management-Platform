import React, { useEffect, useState } from "react";
import axios from "axios";
import "./WelcomeSection.css";

const WelcomeSection = () => {
  const [stats, setStats] = useState({
    totalCsStudents: 0,
    unassignedCount: 0,
    formedTeamsCount: 0,
    formingTeamsCount: 0,
    totalTeamMembers: 0,
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await axios.get("/team-stats");
        console.log("Stats response:", response.data);
        setStats(response.data);
      } catch (error) {
        console.error("Error fetching statistics:", error);
      }
    };

    fetchStats();
  }, []);

  return (
    <div className="welcome">
      <h2 >Teams Statistics Overview</h2>
      <div className="stats-grid">
        {/* <div className="stat-card total">
           <div className="stat-label">Total Students</div>
          <div className="stat-number">{stats.totalCsStudents}</div>
        </div> */}
        
        <div className="stat-card unassigned">
          <div className="stat-label">Yet to Form Teams</div>
          <div className="stat-number">{stats.unassignedCount}</div>
        </div>

        <div className="stat-card teams">
          <div className="stat-label">Teams Formed</div>
          <div className="stat-number">{stats.formedTeamsCount}</div>
        </div>

        <div className="stat-card teams">
          <div className="stat-label">Teams in Formation</div>
          <div className="stat-number">{stats.formingTeamsCount}</div>
        </div>

        <div className="stat-card total">
          <div className="stat-label">Students in Teams</div>
          <div className="stat-number">{stats.totalTeamMembers}</div>
        </div>
      </div>
    </div>
  );
};

export default WelcomeSection;

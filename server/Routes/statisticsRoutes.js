const express = require('express');
const router = express.Router();
const Team = require('../Models/Team');
const Student = require('../Models/Student');
const { FormingTeam } = require('../Models/FormingTeam');

// Get team statistics
router.get("/", async (req, res) => {
  try {
    // Get counts from different collections
    const [unassignedStudents, formedTeams, formingTeams] = await Promise.all([
      Student.find({ teamId: { $exists: false } }),
      Team.find({}),
      FormingTeam.find({})
    ]);

    // Calculate statistics
    const unassignedCount = unassignedStudents.length;
    const formedTeamsCount = formedTeams.length;
    const formingTeamsCount = formingTeams.length;
    const totalTeamMembers = formedTeamsCount * 4; // Assuming 4 members per team

    res.json({
      unassignedCount,
      formedTeamsCount,
      formingTeamsCount,
      totalTeamMembers
    });
  } catch (error) {
    console.error("Error fetching team statistics:", error);
    res.status(500).json({ message: "Error fetching team statistics", error: error.message });
  }
});

module.exports = router;

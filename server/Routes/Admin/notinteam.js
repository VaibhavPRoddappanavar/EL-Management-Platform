const express = require("express");
const router = express.Router();
const Department = require("../../Models/StudentInfo");
const Team = require("../../Models/Team");

router.get("/unassigned", async (req, res) => {
  try {
    const includedDepartments = ["AI", "CS", "CD", "CY", "IS"];

    // Fetch students from departments
    const departments = await Department.find({
      departmentCode: { $in: includedDepartments },
    });

    const allStudents = departments.flatMap((dept) =>
      dept.students.map((student) => ({
        ...student.toObject(),
        departmentCode: dept.departmentCode,
      }))
    );

    // Debug: Check if students are fetched correctly
    console.log("All Students:", allStudents);

    // Fetch all emails of students already in teams
    const teams = await Team.find({});
    const teamEmails = new Set(
      teams.flatMap((team) => [
        team.TeamleaderEmailID,
        team.TeamMember1EmailID,
        team.TeamMember2EmailID,
        team.TeamMember3EmailID,
        team.TeamMember4EmailID,
      ])
    );

    // Debug: Check the set of emails
    console.log("Team Emails:", Array.from(teamEmails));

    // Filter out students whose email is already in a team
    const unassignedStudents = allStudents.filter(
      (student) => !teamEmails.has(student.email) // Matching student email with team emails
    );

    // Debug: Check the unassigned students
    console.log("Unassigned Students:", unassignedStudents);

    res.status(200).json(unassignedStudents);
  } catch (error) {
    console.error("Error fetching unassigned students:", error);
    res.status(500).json({ error: "Failed to fetch unassigned students." });
  }
});

module.exports = router;

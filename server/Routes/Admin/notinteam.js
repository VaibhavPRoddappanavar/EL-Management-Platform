const express = require("express");
const router = express.Router();
const Department = require("../../Models/StudentInfo");
const Team = require("../../Models/Team");
const { FormingTeam } = require("../../Models/FormingTeam");

router.get("/unassigned", async (req, res) => {
  try {
    // Using the same departments as statisticsRoutes.js
    const includedDepartments = ["CS", "IS", "AI", "CD", "CY"];

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

    console.log("Total students before filtering:", allStudents.length);
    console.log("Department counts:", departments.reduce((acc, dept) => {
      acc[dept.departmentCode] = dept.students.length;
      return acc;
    }, {}));

    // Get all assigned emails from both Teams and FormingTeams
    const [teams, formingTeams] = await Promise.all([
      Team.find({}),
      FormingTeam.find({})
    ]);

    // Create a set of all assigned emails
    const assignedEmails = new Set();

    // Add emails from formed teams
    teams.forEach(team => {
      assignedEmails.add(team.TeamleaderEmailID);
      if (team.TeamMember1EmailID) assignedEmails.add(team.TeamMember1EmailID);
      if (team.TeamMember2EmailID) assignedEmails.add(team.TeamMember2EmailID);
      if (team.TeamMember3EmailID) assignedEmails.add(team.TeamMember3EmailID);
      if (team.TeamMember4EmailID) assignedEmails.add(team.TeamMember4EmailID);
    });

    // Add emails from forming teams
    formingTeams.forEach(team => {
      assignedEmails.add(team.TeamleaderEmailID);
      if (team.members) {
        team.members.forEach(member => {
          assignedEmails.add(member.email);
        });
      }
    });

    console.log("Total assigned emails:", assignedEmails.size);

    // Filter out students whose email is in either a team or forming team
    const unassignedStudents = allStudents.filter(
      (student) => !assignedEmails.has(student.email)
    );

    console.log("Total unassigned students:", unassignedStudents.length);
    console.log("Unassigned by department:", unassignedStudents.reduce((acc, student) => {
      acc[student.departmentCode] = (acc[student.departmentCode] || 0) + 1;
      return acc;
    }, {}));

    res.status(200).json(unassignedStudents);
  } catch (error) {
    console.error("Error fetching unassigned students:", error);
    res.status(500).json({ error: "Failed to fetch unassigned students." });
  }
});

module.exports = router;

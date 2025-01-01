const express = require('express');
const router = express.Router();
const Team = require('../Models/Team');
const Student = require('../Models/Student');
const { FormingTeam } = require('../Models/FormingTeam');
const Department = require('../Models/StudentInfo');

// Get team statistics
router.get("/", async (req, res) => {
  try {
    // Get all data needed for calculations
    const [allDepartments, formedTeams, formingTeams] = await Promise.all([
      Department.find({}),
      Team.find({}),
      FormingTeam.find({})
    ]);

    // Calculate total number of CS cluster students
    const csClusterDepts = ['CS', 'IS', 'AI', 'CD', 'CY'];
    console.log('Looking for departments:', csClusterDepts);
    
    // Log department-wise student counts
    const deptCounts = {};
    allDepartments.forEach(dept => {
      if (csClusterDepts.includes(dept.departmentCode)) {
        deptCounts[dept.departmentCode] = dept.students.length;
      }
    });
    console.log('Department counts:', deptCounts);
    
    const totalCsStudents = allDepartments.reduce((total, dept) => {
      if (csClusterDepts.includes(dept.departmentCode)) {
        return total + dept.students.length;
      }
      return total;
    }, 0);

    console.log('Total CS students found:', totalCsStudents);

    // Get all student emails that are in teams and count total team members
    const assignedEmails = new Set();
    let totalTeamMembers = 0;

    // Add emails from formed teams
    formedTeams.forEach(team => {
      let teamMemberCount = 1; // Start with 1 for leader
      assignedEmails.add(team.TeamleaderEmailID);
      
      if (team.TeamMember1EmailID) {
        assignedEmails.add(team.TeamMember1EmailID);
        teamMemberCount++;
      }
      if (team.TeamMember2EmailID) {
        assignedEmails.add(team.TeamMember2EmailID);
        teamMemberCount++;
      }
      if (team.TeamMember3EmailID) {
        assignedEmails.add(team.TeamMember3EmailID);
        teamMemberCount++;
      }
      if (team.TeamMember4EmailID) {
        assignedEmails.add(team.TeamMember4EmailID);
        teamMemberCount++;
      }
      totalTeamMembers += teamMemberCount;
    });

    // Add emails from forming teams
    formingTeams.forEach(team => {
      assignedEmails.add(team.TeamleaderEmailID);
      totalTeamMembers += 1; // Count leader
      if (team.members) {
        team.members.forEach(member => {
          assignedEmails.add(member.email);
          totalTeamMembers += 1;
        });
      }
    });

    console.log('Total assigned emails:', assignedEmails.size);

    // Get assigned CS cluster students with department-wise breakdown
    const assignedByDept = {};
    const assignedCsStudents = allDepartments.reduce((count, dept) => {
      if (csClusterDepts.includes(dept.departmentCode)) {
        const deptAssignedCount = dept.students.filter(student => 
          assignedEmails.has(student.email)
        ).length;
        assignedByDept[dept.departmentCode] = deptAssignedCount;
        return count + deptAssignedCount;
      }
      return count;
    }, 0);

    console.log('Assigned students by department:', assignedByDept);
    console.log('Total assigned CS students:', assignedCsStudents);

    // Calculate statistics
    const unassignedCsCount = totalCsStudents - assignedCsStudents;
    const unassignedByDept = {};
    for (const dept of csClusterDepts) {
      unassignedByDept[dept] = deptCounts[dept] - (assignedByDept[dept] || 0);
    }
    console.log('Unassigned students by department:', unassignedByDept);
    console.log('Total unassigned CS students:', unassignedCsCount);

    const formedTeamsCount = formedTeams.length;
    const formingTeamsCount = formingTeams.length;

    res.json({
      unassignedCount: unassignedCsCount,
      totalCsStudents,
      assignedCsStudents,
      formedTeamsCount,
      formingTeamsCount,
      totalTeamMembers,
      debug: {
        departmentCounts: deptCounts,
        assignedByDepartment: assignedByDept,
        unassignedByDepartment: unassignedByDept
      }
    });
  } catch (error) {
    console.error("Error fetching team statistics:", error);
    res.status(500).json({ message: "Error fetching team statistics", error: error.message });
  }
});

module.exports = router;

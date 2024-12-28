const express = require('express');
const router = express.Router();
const teacherAuth = require('../../middleware/teacherAuth');
const Marks = require('../../Models/Marks');
const Team = require('../../Models/Team');

// Submit marks for a team
router.post('/submit-marks', teacherAuth, async (req, res) => {
  try {
    console.log("Received marks submission:", req.body);

    const { teamId, phase, studentMarks, generalFeedback } = req.body;

    // Add these debug logs
    const teacher = req.teacher;
    console.log("Teacher:", {
      id: teacher._id,
      assignedTeams: teacher.assignedTeams,
      teamToGrade: teamId
    });

    // Check if teamId is in assignedTeams (convert both to strings for comparison)
    const isTeamAssigned = teacher.assignedTeams.some(
      assignedTeam => assignedTeam.toString() === teamId.toString()
    );
    console.log("Is team assigned:", isTeamAssigned);

    if (!isTeamAssigned) {
      return res.status(403).json({ 
        message: 'Not authorized to grade this team',
        details: {
          teacherId: teacher._id,
          assignedTeams: teacher.assignedTeams,
          requestedTeam: teamId
        }
      });
    }

    // Get team details to verify student emails
    const team = await Team.findById(teamId);
    if (!team) {
      return res.status(404).json({ message: 'Team not found' });
    }

    // Get all valid team member emails
    const teamEmails = [
      team.TeamleaderEmailID,
      team.TeamMember1EmailID,
      team.TeamMember2EmailID,
      team.TeamMember3EmailID,
      team.TeamMember4EmailID
    ].filter(Boolean);

    console.log('Team emails:', teamEmails);
    console.log('Received student marks:', studentMarks);

    // Validate student marks
    const validatedStudentMarks = studentMarks
      .filter(student => student.email) // Only include students with emails
      .map(student => ({
        studentEmail: student.email,
        studentName: student.name,
        studentUSN: student.usn,
        marks: parseFloat(student.marks),
        individualFeedback: student.feedback
      }))
      .filter(mark => 
        teamEmails.includes(mark.studentEmail) && 
        !isNaN(mark.marks) && 
        mark.marks >= 0 && 
        mark.marks <= 100
      );

    console.log('Validated marks:', validatedStudentMarks);

    if (validatedStudentMarks.length === 0) {
      return res.status(400).json({ 
        message: 'No valid student marks provided',
        details: {
          validEmails: teamEmails,
          receivedMarks: studentMarks.map(m => ({
            email: m.email,
            marks: m.marks
          }))
        }
      });
    }

    // Create or update marks
    const marksRecord = await Marks.findOneAndUpdate(
      { 
        teamId, 
        submittedBy: teacher._id, 
        phase 
      },
      {
        studentMarks: validatedStudentMarks,
        generalFeedback,
        submittedAt: new Date()
      },
      { 
        new: true, 
        upsert: true 
      }
    );

    console.log('Marks saved successfully:', marksRecord);

    res.json({ 
      message: 'Marks submitted successfully', 
      data: marksRecord 
    });
  } catch (error) {
    console.error('Error submitting marks:', error);
    res.status(500).json({ 
      message: 'Error submitting marks', 
      error: error.message,
      details: 'An error occurred while saving the marks'
    });
  }
});

// Get marks for a team
router.get('/team-marks/:teamId', teacherAuth, async (req, res) => {
  try {
    const { teamId } = req.params;
    
    // Verify teacher's authorization
    const isTeamAssigned = req.teacher.assignedTeams.some(
      assignedTeam => assignedTeam.toString() === teamId
    );
    
    if (!isTeamAssigned) {
      return res.status(403).json({ message: 'Not authorized to view this team\'s marks' });
    }

    const marks = await Marks.find({ teamId })
      .sort({ phase: 1, submittedAt: -1 });

    res.json(marks);
  } catch (error) {
    console.error('Error fetching team marks:', error);
    res.status(500).json({ message: 'Error fetching team marks' });
  }
});

module.exports = router;
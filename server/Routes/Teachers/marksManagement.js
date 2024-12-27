const express = require('express');
const router = express.Router();
const teacherAuth = require('../../middleware/teacherAuth');
const ProjectMarks = require('../../Models/TeachersModels/ProjectMarks');
const Team = require('../../Models/Team');

// Submit marks for a team
router.post('/submit-marks', teacherAuth, async (req, res) => {
  try {
    const { teamId, phase, studentMarks, generalFeedback } = req.body;

    // Validate if teacher is assigned to this team
    const teacher = req.teacher;
    if (!teacher.assignedTeams.includes(teamId)) {
      return res.status(403).json({ message: 'Not authorized to grade this team' });
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

    // Validate student marks
    const validatedStudentMarks = studentMarks.filter(mark => 
      teamEmails.includes(mark.studentEmail) && 
      mark.marks >= 0 && 
      mark.marks <= 100
    );

    if (validatedStudentMarks.length !== studentMarks.length) {
      return res.status(400).json({ message: 'Invalid student marks data' });
    }

    // Create or update marks
    const marksRecord = await ProjectMarks.findOneAndUpdate(
      { 
        teamId, 
        teacherId: teacher._id, 
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

    res.json({ message: 'Marks submitted successfully', data: marksRecord });
  } catch (error) {
    console.error('Error submitting marks:', error);
    res.status(500).json({ message: 'Error submitting marks' });
  }
});

// Get marks for a team
router.get('/team-marks/:teamId', teacherAuth, async (req, res) => {
  try {
    const { teamId } = req.params;
    const marks = await ProjectMarks.find({
      teamId,
      teacherId: req.teacher._id
    }).sort({ phase: 1 });

    res.json(marks);
  } catch (error) {
    console.error('Error fetching marks:', error);
    res.status(500).json({ message: 'Error fetching marks' });
  }
});

// Update marks for a team
router.put('/update-marks/:markId', teacherAuth, async (req, res) => {
  try {
    const { markId } = req.params;
    const { studentMarks, generalFeedback } = req.body;

    const mark = await ProjectMarks.findById(markId);
    if (!mark) {
      return res.status(404).json({ message: 'Marks record not found' });
    }

    if (mark.teacherId.toString() !== req.teacher._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to update these marks' });
    }

    mark.studentMarks = studentMarks;
    mark.generalFeedback = generalFeedback;
    mark.submittedAt = new Date();

    await mark.save();
    res.json({ message: 'Marks updated successfully', data: mark });
  } catch (error) {
    console.error('Error updating marks:', error);
    res.status(500).json({ message: 'Error updating marks' });
  }
});

module.exports = router; 
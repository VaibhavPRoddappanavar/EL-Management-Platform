const express = require('express');
const router = express.Router();
const Student = require('../Models/Student'); // Ensure correct path
const Team = require('../Models/Team'); // Ensure correct path
const auth = require('../middleware/authenticateToken'); // Assuming you have auth middleware

// Get the team details of the logged-in student
router.get('/my-team', auth, async (req, res) => {
    try {
        // Get the student who is logged in
        const student = await Student.findById(req.student.studentId);
        if (!student) {
            return res.status(404).json({ message: 'Student not found' });
        }

        // Get all team members with the same teamId as the logged-in student
        const teamMembers = await Team.find({ teamId: student.teamId });

        if (teamMembers.length === 0) {
            return res.status(404).json({ message: 'Team not found' });
        }

        // Return the team members' details
        res.json({
            message: 'Team found',
            teamMembers
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error', error });
    }
});

module.exports = router;

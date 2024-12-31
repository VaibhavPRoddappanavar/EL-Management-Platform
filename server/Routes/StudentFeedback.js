const express = require('express');
const router = express.Router();
const auth = require('../middleware/authenticateToken');
const Marks = require('../Models/Marks');
const Team = require('../Models/Team');

// Get feedback for a student
router.get('/feedback', auth, async (req, res) => {
    try {
        const studentEmail = req.user.email;
        console.log('Fetching feedback for student:', studentEmail);

        // Find the team that the student belongs to
        const team = await Team.findOne({
            $or: [
                { TeamleaderEmailID: studentEmail },
                { TeamMember1EmailID: studentEmail },
                { TeamMember2EmailID: studentEmail },
                { TeamMember3EmailID: studentEmail },
                { TeamMember4EmailID: studentEmail }
            ]
        });

        console.log('Found team:', team ? team._id : 'No team found');

        if (!team) {
            return res.status(404).json({ message: 'Team not found for this student' });
        }

        // Get all marks/feedback for this team
        const marks = await Marks.find({ teamId: team._id })
            .sort({ submittedAt: -1 });

        console.log('Found marks:', marks.length);

        // Group marks by phase and only keep the latest submission for each phase
        const latestMarks = marks.reduce((acc, mark) => {
            if (!acc[mark.phase] || mark.submittedAt > acc[mark.phase].submittedAt) {
                acc[mark.phase] = mark;
            }
            return acc;
        }, {});

        console.log('Latest marks by phase:', Object.keys(latestMarks));

        // Convert to array and send
        const feedback = Object.values(latestMarks);
        console.log('Sending feedback:', JSON.stringify(feedback, null, 2));
        res.json(feedback);

    } catch (error) {
        console.error('Error fetching student feedback:', error);
        res.status(500).json({ message: 'Error fetching feedback' });
    }
});

module.exports = router;

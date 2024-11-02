// routes/teamRoutes.js
const express = require('express');
const router = express.Router();
const Team = require('../Models/Team');  // Replace with your actual model path
const authMiddleware = require('../middleware/authenticateToken');

// Team Details Route
router.get('/team-details', authMiddleware, async (req, res) => {
    try {
        const { email } = req.user;

        const teamMember = await Team.findOne({
            $or: [
                { TeamleaderEmailID: email },
                { TeamMember1EmailID: email },
                { TeamMember2EmailId: email },
                { TeamMember3EmailID: email },
                { TeamMember4EmailID: email },
            ]
        });

        if (!teamMember) {
            return res.status(404).json({ message: 'Team not found. You are not part of any team.' });
        }

        res.json({
            teamDetails: {
                teamId: teamMember._id,
                theme: teamMember.Theme,
                teamLeader: {
                    name: teamMember.TeamLeaderName,
                    email: teamMember.TeamleaderEmailID,
                    mobile: teamMember.TeamleaderMobileNumber,
                    usn: teamMember.TeamLeaderUSN,  // Add Team Leader USN here
                },
                teamMembers: [
                    {
                        name: teamMember.TeamMember1Name,
                        email: teamMember.TeamMember1EmailID,
                        mobile: teamMember.TeamMember1MobileNumber,
                        program: teamMember.TeamMember1Program,
                        usn: teamMember.TeamMember1USN,  // Add USN for Team Member 1
                    },
                    {
                        name: teamMember.TeamMember2Name,
                        email: teamMember.TeamMember2EmailId,
                        mobile: teamMember.TeamMember2MobileNumber,
                        program: teamMember.TeamMember2Program,
                        usn: teamMember.TeamMember2USN,  // Add USN for Team Member 2
                    },
                    {
                        name: teamMember.TeamMember3Name,
                        email: teamMember.TeamMember3EmailID,
                        mobile: teamMember.TeamMember3MobileNumber,
                        program: teamMember.TeamMember3Program,
                        usn: teamMember.TeamMember3USN,  // Add USN for Team Member 3
                    },
                    {
                        name: teamMember.TeamMember4Name,
                        email: teamMember.TeamMember4EmailID,
                        mobile: teamMember.TeamMember4MobileNumber,
                        program: teamMember.TeamMember4Program,
                        usn: teamMember.TeamMember4USN,  // Add USN for Team Member 4
                    },
                ].filter(member => member.name)  // Filter out empty members
            }
        });
    } catch (error) {
        console.error('Error occurred during fetching team details:', error);
        res.status(500).json({ message: 'Server error', error });
    }
});

module.exports = router;

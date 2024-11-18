// routes/teamRoutes.js
const express = require('express');
const router = express.Router();
const Team = require('../Models/Team');  // Replace with your actual model path
const authMiddleware = require('../middleware/authenticateToken');

// Team Details Route
router.get('/team-details', authMiddleware, async (req, res) => {
    try {
        const inputEmail = req.user.email.trim(); // Trim spaces from the input email

        // Retrieve all teams where the email might match in any field
        const teams = await Team.find({
            $or: [
                { TeamleaderEmailID: new RegExp(inputEmail) },
                { TeamMember1EmailID: new RegExp(inputEmail) },
                { TeamMember2EmailID: new RegExp(inputEmail) },
                { TeamMember3EmailID: new RegExp(inputEmail) },
                { TeamMember4EmailID: new RegExp(inputEmail) },
            ]
        });

        // Now filter for an exact match by trimming spaces
        const team = teams.find(team =>
            [
                team.TeamleaderEmailID.trim(),
                team.TeamMember1EmailID?.trim(),
                team.TeamMember2EmailID?.trim(),
                team.TeamMember3EmailID?.trim(),
                team.TeamMember4EmailID?.trim()
            ].includes(inputEmail)
        );

        // If no matching team found
        if (!team) {
            return res.status(404).json({ message: 'Team not found. You are not part of any team.' });
        }

        // Send the team details in response
        res.json({
            teamDetails: {
                teamId: team._id,
                theme: team.Theme,
                teamLeader: {
                    name: team.TeamLeaderName,
                    email: team.TeamleaderEmailID.trim(),
                    mobile: team.TeamleaderMobileNumber,
                    usn: team.TeamLeaderUSN,
                },
                teamMembers: [
                    {
                        name: team.TeamMember1Name,
                        email: team.TeamMember1EmailID?.trim(),
                        mobile: team.TeamMember1MobileNumber,
                        program: team.TeamMember1Program,
                        usn: team.TeamMember1USN,
                    },
                    {
                        name: team.TeamMember2Name,
                        email: team.TeamMember2EmailID?.trim(),
                        mobile: team.TeamMember2MobileNumber,
                        program: team.TeamMember2Program,
                        usn: team.TeamMember2USN,
                    },
                    {
                        name: team.TeamMember3Name,
                        email: team.TeamMember3EmailID?.trim(),
                        mobile: team.TeamMember3MobileNumber,
                        program: team.TeamMember3Program,
                        usn: team.TeamMember3USN,
                    },
                    {
                        name: team.TeamMember4Name,
                        email: team.TeamMember4EmailID?.trim(),
                        mobile: team.TeamMember4MobileNumber,
                        program: team.TeamMember4Program,
                        usn: team.TeamMember4USN,
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

const express = require('express');
const router = express.Router();
const Team = require('../Models/Team');  // Ensure this path is correct
const authMiddleware = require('../middleware/authenticateToken'); // Ensure this path is correct

// Team Creation Route
router.post('/create-team', authMiddleware, async (req, res) => {
    const {
        TeamLeaderUSN,
        TeamLeaderName,
        TeamleaderEmailID,
        TeamleaderMobileNumber,
        TeamleaderProgram,
        Theme,
        Teammember1USN,
        TeamMember1Name,
        TeamMember1EmailID,
        TeamMember1MobileNumber,
        TeamMember1Program,
        Teammember2USN,
        TeamMember2Name,
        TeamMember2EmailId,
        TeamMember2MobileNumber,
        TeamMember2Program,
        Teammember3USN,
        TeamMember3Name,
        TeamMember3EmailID,
        TeamMember3MobileNumber,
        TeamMember3Program,
        Teammember4USN,
        TeamMember4Name,
        TeamMember4EmailID,
        TeamMember4MobileNumber,
        TeamMember4Program
    } = req.body;

    const newTeam = new Team({
        TeamLeaderUSN,
        TeamLeaderName,
        TeamleaderEmailID,
        TeamleaderMobileNumber,
        TeamleaderProgram,
        Theme,
        Teammember1USN,
        TeamMember1Name,
        TeamMember1EmailID,
        TeamMember1MobileNumber,
        TeamMember1Program,
        Teammember2USN,
        TeamMember2Name,
        TeamMember2EmailId,
        TeamMember2MobileNumber,
        TeamMember2Program,
        Teammember3USN,
        TeamMember3Name,
        TeamMember3EmailID,
        TeamMember3MobileNumber,
        TeamMember3Program,
        Teammember4USN,
        TeamMember4Name,
        TeamMember4EmailID,
        TeamMember4MobileNumber,
        TeamMember4Program
    });

    try {
        const savedTeam = await newTeam.save();
        res.status(201).json({ message: 'Team created successfully', team: savedTeam });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Export the router
module.exports = router;

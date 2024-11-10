// Routes/teamApplicationRoutes.js
const express = require('express');
const router = express.Router();
const TeamApplication = require('../Models/TeamApplication');
const FormingTeam = require('../Models/FormingTeam');
const Team = require('../Models/Team');
const authMiddleware = require('../middleware/authenticateToken');

// Apply to join a team
router.post('/apply', authMiddleware, async (req, res) => {
    const { teamId, applicantName, applicantProgram, applicantUSN } = req.body;
    const applicantEmail = req.user.email;

    try {
        // Check if already applied
        const existingApplication = await TeamApplication.findOne({
            teamId,
            applicantEmail,
            status: 'PENDING'
        });

        if (existingApplication) {
            return res.status(400).json({
                message: 'You have already applied to this team'
            });
        }

        // Create new application
        const application = new TeamApplication({
            teamId,
            applicantEmail,
            applicantName,
            applicantProgram,
            applicantUSN
        });

        await application.save();
        res.status(201).json({
            message: 'Application submitted successfully',
            application
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get all applications for a team (team leader only)
router.get('/team/:teamId', authMiddleware, async (req, res) => {
    try {
        const team = await FormingTeam.findById(req.params.teamId);
        if (team.TeamleaderEmailID !== req.user.email) {
            return res.status(403).json({
                message: 'Only team leader can view applications'
            });
        }

        const applications = await TeamApplication.find({
            teamId: req.params.teamId,
            status: 'PENDING'
        });

        res.json(applications);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Handle application (accept/reject)
router.put('/handle/:applicationId', authMiddleware, async (req, res) => {
    const { status, position } = req.body;

    try {
        const application = await TeamApplication.findById(req.params.applicationId);
        const team = await FormingTeam.findById(application.teamId);

        // Verify team leader
        if (team.TeamleaderEmailID !== req.user.email) {
            return res.status(403).json({
                message: 'Only team leader can handle applications'
            });
        }

        // Update application status
        application.status = status;
        await application.save();

        if (status === 'ACCEPTED') {
            // Update team member
            team[position + 'Name'] = application.applicantName;
            team[position + 'EmailID'] = application.applicantEmail;
            team[position + 'Program'] = application.applicantProgram;
            team[position + 'USN'] = application.applicantUSN;

            // Validate team composition
            const validationResult = team.validateTeamComposition();
            if (!validationResult.isValid) {
                return res.status(400).json({
                    message: validationResult.error
                });
            }

            await team.save();
        }

        res.json({ message: `Application ${status.toLowerCase()}` });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
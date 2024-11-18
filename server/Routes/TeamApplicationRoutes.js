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

// Apply for a team
router.post('/:teamId/apply', authMiddleware, async (req, res) => {
    try {
        const { teamId } = req.params; // Extract the team ID from the route parameter
        const userId = req.user._id; // User ID from authMiddleware

        // Find the team
        const team = await FormingTeam.findById(teamId);
        if (!team) {
            return res.status(404).json({ message: 'Team not found' });
        }

        // Check if the user is already a member or the team leader
        const isAlreadyMember = team.members.some(member => member.userId === userId);
        const isTeamLeader = team.TeamleaderEmailID === req.user.email;
        if (isAlreadyMember || isTeamLeader) {
            return res.status(400).json({ message: 'You are already part of this team' });
        }

        // Check if there is already a pending invite or application for this user
        const hasPendingInvite = team.pendingInvites.some(
            invite => invite.email === req.user.email && invite.status === 'PENDING'
        );

        if (hasPendingInvite) {
            return res.status(400).json({ message: 'You have already applied or been invited to this team' });
        }

        // Check if the team has less than 5 members
        if (team.members.length >= 5) {
            return res.status(400).json({ message: 'Team is already full' });
        }

        // Add the application to the pendingInvites array with type set to 'APPLIED'
        team.pendingInvites.push({
            email: req.user.email, // From authMiddleware
            program: req.user.program, // From authMiddleware
            status: 'PENDING', // Default status
            type: 'APPLIED' // Type for application
        });

        await team.save();
        res.json({ message: 'Application submitted successfully' });
    } catch (error) {
        console.error('Error applying to the team:', error);
        res.status(500).json({ message: 'An error occurred while submitting your application' });
    }
});


// Handle application (accept/reject)
router.put('/handle/:applicationId', authMiddleware, async (req, res) => {
    const { status } = req.body;

    try {
        const application = await TeamApplication.findById(req.params.applicationId);
        if (!application) {
            return res.status(404).json({ message: 'Application not found' });
        }

        const team = await FormingTeam.findById(application.teamId);
        if (!team) {
            return res.status(404).json({ message: 'Team not found' });
        }

        // Verify team leader
        if (team.TeamleaderEmailID !== req.user.email) {
            return res.status(403).json({ message: 'Only the team leader can handle applications' });
        }

        // Update application status
        application.status = status;
        await application.save();

        if (status === 'ACCEPTED') {
            // Check if team has space for more members
            if (team.members.length >= 5) {
                return res.status(400).json({ message: 'Team already has the maximum number of members' });
            }

            // Add the accepted member to the team
            team.members.push({
                userId: application.applicantId, // Applicant's user ID
                name: application.applicantName,
                email: application.applicantEmail,
                program: application.applicantProgram,
                usn: application.applicantUSN
            });

            // Validate team composition
            const validationResult = team.validateTeamComposition();
            if (!validationResult.isValid) {
                return res.status(400).json({ message: validationResult.error });
            }

            await team.save();
        }

        res.json({ message: `Application ${status.toLowerCase()}` });
    } catch (error) {
        console.error('Error handling application:', error);
        res.status(500).json({ message: 'An error occurred while handling the application' });
    }
});

module.exports = router;
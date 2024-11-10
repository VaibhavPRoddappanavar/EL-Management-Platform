const express = require('express');
const router = express.Router();
const FormingTeam = require('../Models/FormingTeam');
const Team = require('../Models/Team');
const authMiddleware = require('../middleware/authenticateToken');

// Create a forming team
router.post('/create', authMiddleware, async (req, res) => {
    try {
        // Check if user is already in a team
        const existingTeam = await Team.findOne({
            $or: [
                { TeamleaderEmailID: req.user.email },
                { TeamMember1EmailID: req.user.email },
                { TeamMember2EmailId: req.user.email },
                { TeamMember3EmailID: req.user.email },
                { TeamMember4EmailID: req.user.email }
            ]
        });

        if (existingTeam) {
            return res.status(400).json({
                message: 'You are already part of a registered team'
            });
        }

        // Check if user already has a forming team
        const existingFormingTeam = await FormingTeam.findOne({
            $or: [
                { TeamleaderEmailID: req.user.email },
                { 'members.email': req.user.email }
            ]
        });

        if (existingFormingTeam) {
            return res.status(400).json({
                message: 'You already have a team in formation'
            });
        }

        const formingTeam = new FormingTeam({
            ...req.body,
            TeamleaderEmailID: req.user.email,
            members: []
        });

        await formingTeam.save();
        res.status(201).json({
            message: 'Team formation started',
            team: formingTeam
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Invite member
router.post('/:teamId/invite', authMiddleware, async (req, res) => {
    const { email, program, position } = req.body;

    try {
        const team = await FormingTeam.findById(req.params.teamId);
        
        if (!team) {
            return res.status(404).json({ message: 'Team not found' });
        }

        if (team.TeamleaderEmailID !== req.user.email) {
            return res.status(403).json({ message: 'Only team leader can send invites' });
        }

        // Check if position is already filled
        if (team.members.some(m => m.position === position)) {
            return res.status(400).json({ message: 'Position already filled' });
        }

        // Check for pending invite
        if (team.pendingInvites.some(
            invite => invite.email === email && invite.status === 'PENDING'
        )) {
            return res.status(400).json({ message: 'Invite already pending' });
        }

        team.pendingInvites.push({ email, program, position });
        await team.save();

        res.json({ message: 'Invite sent successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Accept/Reject invite
router.put('/invite/:teamId/respond', authMiddleware, async (req, res) => {
    const { status, name, usn, mobileNumber } = req.body;

    try {
        const team = await FormingTeam.findById(req.params.teamId);
        
        if (!team) {
            return res.status(404).json({ message: 'Team not found' });
        }

        const invite = team.pendingInvites.find(
            invite => invite.email === req.user.email && invite.status === 'PENDING'
        );

        if (!invite) {
            return res.status(404).json({ message: 'No pending invite found' });
        }

        invite.status = status;

        if (status === 'ACCEPTED') {
            team.members.push({
                name,
                usn,
                email: req.user.email,
                mobileNumber,
                program: invite.program,
                position: invite.position
            });

            // Validate team composition
            // const validationResult = await team.validateTeamComposition();
            // if (!validationResult.isValid) {
            //     return res.status(400).json({ message: validationResult.error });
            // }
        }

        await team.save();
        res.json({ message: `Invite ${status.toLowerCase()} successfully` });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Finalize team
router.post('/:teamId/finalize', authMiddleware, async (req, res) => {
    try {
        const formingTeam = await FormingTeam.findById(req.params.teamId);
        
        if (!formingTeam) {
            return res.status(404).json({ message: 'Team not found' });
        }

        if (formingTeam.TeamleaderEmailID !== req.user.email) {
            return res.status(403).json({ message: 'Only team leader can finalize team' });
        }

        // Minimum 4 members required (including leader)
        if (formingTeam.members.length < 3) {
            return res.status(400).json({
                message: 'Minimum 4 members required to finalize team'
            });
        }

        // Validate final composition
        const validationResult = await formingTeam.validateTeamComposition();
        if (!validationResult.isValid) {
            return res.status(400).json({ message: validationResult.error });
        }

        // Convert to final team format
        const finalTeamData = formingTeam.convertToFinalTeam();
        const finalTeam = new Team(finalTeamData);
        await finalTeam.save();

        // Remove forming team
        await formingTeam.delete();

        res.json({
            message: 'Team finalized successfully',
            team: finalTeam
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
const express = require('express');
const router = express.Router();
const { FormingTeam, clusterPrograms } = require('../Models/FormingTeam'); // Updated import
const Team = require('../Models/Team');
const Department = require('../Models/StudentInfo'); // Import the Department model
const Student = require('../Models/Student'); // Assuming Student model is imported
const authMiddleware = require('../middleware/authenticateToken');

// Check if the user is already in a team or forming team

// Fetch all invites for a specific team
router.get('/:teamId/invites', authMiddleware, async (req, res) => {
    try {
        const team = await FormingTeam.findById(req.params.teamId).lean();

        if (!team) {
            return res.status(404).json({ message: 'Team not found' });
        }

        // Separate invites based on their type (SENT vs APPLIED) and status
        const sentInvites = team.pendingInvites.filter(invite => invite.type === 'SENT');
        const appliedInvites = team.pendingInvites.filter(invite => invite.type === 'APPLIED');

        // Group by status within each type
        const categorizeByStatus = (invites) => ({
            pending: invites.filter(invite => invite.status === 'PENDING'),
            accepted: invites.filter(invite => invite.status === 'ACCEPTED'),
            rejected: invites.filter(invite => invite.status === 'REJECTED')
        });

        res.json({
            sentInvites: categorizeByStatus(sentInvites),
            appliedInvites: categorizeByStatus(appliedInvites)
        });
    } catch (error) {
        console.error('Error fetching all invites:', error);
        res.status(500).json({ message: 'An error occurred while fetching invites' });
    }
});



// Backend - Express route handler
router.post('/check-team-status', authMiddleware, async (req, res) => {
    try {
        const { email } = req.body; // Extract email from the request body
        console.log('Provided email:', email); // Debug log

        if (!email) {
            return res.status(400).json({
                message: 'Email is required in the request body'
            });
        }

        // Check if the user is already in a registered team
        const existingTeam = await Team.findOne({
            $or: [
                { TeamleaderEmailID: email },
                { TeamMember1EmailID: email },
                { TeamMember2EmailID: email },
                { TeamMember3EmailID: email },
                { TeamMember4EmailID: email }
            ]
        }).lean(); // Use lean() for better performance

        console.log('Existing team search result:', existingTeam); // Debug log

        if (existingTeam) {
            return res.status(200).json({
                message: 'You are already part of a registered team',
                existingTeam
            });
        }

        // Check if the user already has a forming team
        const existingFormingTeam = await FormingTeam.findOne({
            $or: [
                { TeamleaderEmailID: email },
                { 'members.email': email }
            ]
        }).lean(); // Use lean() for better performance

        console.log('Existing forming team search result:', existingFormingTeam); // Debug log

        if (existingFormingTeam) {
            return res.status(200).json({
                message: 'You already have a team in formation',
                existingFormingTeam
            });
        }

        // If no team is found, return a relevant message
        res.status(200).json({ message: 'No team found' });
    } catch (error) {
        console.error('Server error:', error); // Debug log
        res.status(500).json({
            message: 'An error occurred while checking team status',
            error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
        });
    }
});



// Create a forming team
router.post('/create', authMiddleware, async (req, res) => {
    const { email, usn, phoneNumber, theme } = req.body;

    try {
        // Check if user is already in a team
        const existingTeam = await Team.findOne({
            $or: [
                { TeamleaderEmailID: req.user.email },
                { TeamMember1EmailID: req.user.email },
                { TeamMember2EmailID: req.user.email },
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

        // Fetch the team leader details from the Student collection using email and USN
        const teamLeader = await Student.findOne({ email });

        if (!teamLeader) {
            return res.status(400).json({
                message: 'Invalid email. Team leader details not found.'
            });
        }

        // Determine the cluster based on the team leader's program (branch)
        let cluster = null;
        Object.keys(clusterPrograms).forEach((key) => {
            if (clusterPrograms[key].includes(teamLeader.branch)) {
                cluster = key;
            }
        });

        if (!cluster) {
            return res.status(400).json({
                message: 'Invalid program, unable to determine cluster.'
            });
        }

        // Create the forming team
        const formingTeam = new FormingTeam({
            TeamLeaderUSN: usn, // Using USN from the request body
            TeamLeaderName: teamLeader.name, // Fetching name from the Student collection
            TeamleaderEmailID: email,
            TeamleaderMobileNumber: phoneNumber,
            TeamleaderProgram: teamLeader.branch, // Using the branch as the program
            Theme: theme,
            members: [],
            pendingInvites: [],
            cluster: cluster, // Assigning the determined cluster
        });

        // Save the forming team
        await formingTeam.save();

        res.status(201).json({
            message: 'Team formation started',
            team: formingTeam
        });
    } catch (error) {
        console.error('Error occurred during team formation:', error);
        res.status(500).json({ message: error.message });
    }
});

// Invite member
router.post('/:teamId/invite', authMiddleware, async (req, res) => {
    const { email, position } = req.body; // Removed program here

    try {
        // Find the team using the provided teamId
        const team = await FormingTeam.findById(req.params.teamId);

        if (!team) {
            return res.status(404).json({ message: 'Team not found' });
        }

        // Check if the user sending the invite is the team leader
        if (team.TeamleaderEmailID !== req.user.email) {
            return res.status(403).json({ message: 'Only team leader can send invites' });
        }

        // Check if the position is already filled
        if (team.members.some(m => m.position === position)) {
            return res.status(400).json({ message: 'Position already filled' });
        }

        // Check for a pending invite
        if (team.pendingInvites.some(
            invite => invite.email === email && invite.status === 'PENDING'
        )) {
            return res.status(400).json({ message: 'Invite already pending' });
        }

        // Fetch the department based on the email
        const department = await Department.findOne({
            'students.email': email
        });

        if (!department) {
            return res.status(400).json({ message: 'Invalid email or student not found in any department' });
        }

        // Extract the department code, handling the special cases for CS-CD and CS-CY
        let departmentCode = department.departmentCode;
        if (departmentCode === 'CS-CD') {
            departmentCode = 'CD';
        } else if (departmentCode === 'CS-CY') {
            departmentCode = 'CY';
        }

        // Check if the department of the invited student matches the program
        if (!clusterPrograms[team.cluster].includes(departmentCode)) {
            return res.status(400).json({ message: 'Cannot invite members from other clusters' });
        }

        // Check if the invited member is already part of a team or forming team
        const existingTeam = await FormingTeam.findOne({
            $or: [
                { 'members.email': email }, // Check if email is a member of a team
                { 'TeamleaderEmailID': email } // Check if email is already a team leader
            ]
        });
        if (existingTeam) {
            return res.status(400).json({ message: 'Invited member is already part of a team' });
        }

        // Add the pending invite
        team.pendingInvites.push({ email, program: team.program, position,status: 'PENDING',
            type: 'SENT' }); // Directly use team.program here
        await team.save();

        res.json({ message: 'Invite sent successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Cancel Invitation
router.post('/:teamId/cancel-invite', authMiddleware, async (req, res) => {
    const { email } = req.body; // The email of the person whose invite you want to cancel

    try {
        // Find the team using the provided teamId
        const team = await FormingTeam.findById(req.params.teamId);

        if (!team) {
            return res.status(404).json({ message: 'Team not found' });
        }

        // Check if the user sending the cancel is the team leader
        if (team.TeamleaderEmailID !== req.user.email) {
            return res.status(403).json({ message: 'Only team leader can cancel invites' });
        }

        // Find the index of the invitation with the given email in the pendingInvites array
        const inviteIndex = team.pendingInvites.findIndex(
            invite => invite.email === email && invite.type === 'SENT' // Check type is 'SENT'
        );

        if (inviteIndex === -1) {
            return res.status(404).json({ message: 'Invitation not found or cannot be canceled' });
        }

        // Remove the invitation from the pendingInvites array
        team.pendingInvites.splice(inviteIndex, 1);
        await team.save();

        res.json({ message: 'Invitation cancelled successfully' });
    } catch (error) {
        console.error('Error canceling invitation:', error);
        res.status(500).json({ message: 'An error occurred while canceling the invitation' });
    }
});


// Get team information (leader and/or members) based on query parameter
router.get('/:teamId/members', authMiddleware, async (req, res) => {
    try {
        // Find the team using the provided teamId
        const team = await FormingTeam.findById(req.params.teamId).lean();

        // Log the fetched team for debugging
        console.log('Fetched team document:', team);

        if (!team) {
            console.error('Team not found in database:', req.params.teamId);
            return res.status(404).json({ message: 'Team not found' });
        }

        // Extract the team leader details
        const teamLeader = {
            TeamLeaderUSN: team.TeamLeaderUSN || 'Not Available',
            TeamLeaderName: team.TeamLeaderName || 'Not Available',
            TeamleaderEmailID: team.TeamleaderEmailID || 'Not Available',
            TeamleaderMobileNumber: team.TeamleaderMobileNumber || 'Not Available',
            TeamleaderProgram: team.TeamleaderProgram || 'Not Available',
            Theme: team.Theme || 'Not Specified'
        };

        // Get the type parameter from query string (default to 'all')
        const infoType = req.query.type?.toLowerCase() || 'all';

        // Prepare the response based on the info type requested
        let response = {};

        switch (infoType) {
            case 'leader':
                response = { teamLeader };
                break;
            case 'members':
                response = { members: team.members || [] };
                break;
            case 'all':
            default:
                response = {
                    teamLeader,
                    members: team.members || []
                };
        }

        // Log the response for debugging
        console.log('Response:', response);

        // Send the response
        res.json(response);
    } catch (error) {
        console.error('Error fetching team information:', error);
        res.status(500).json({ message: 'An error occurred while fetching team information' });
    }
});


// Get members of the forming team
router.get('/:teamId/members', authMiddleware, async (req, res) => {
    try {
        // Find the team using the provided teamId
        const team = await FormingTeam.findById(req.params.teamId).lean();

        if (!team) {
            return res.status(404).json({ message: 'Team not found' });
        }

        // Return the members of the team
        const members = team.members; // Assuming the members are stored in a 'members' field
        res.json({ members });
    } catch (error) {
        console.error('Error fetching team members:', error);
        res.status(500).json({ message: 'An error occurred while fetching team members' });
    }
});



// Accept/Reject invite
router.put('/invite/:teamId/respond', authMiddleware, async (req, res) => {
    const { status, name, usn, program, mobileNumber } = req.body;

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
                program,
                position: invite.position
            });

        }

        await team.save();
        res.json({ message: `Invite ${status.toLowerCase()} successfully` });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

//To remove an team member
router.delete('/:teamId/members/:memberId', authMiddleware, async (req, res) => {
    try {
        const { teamId, memberId } = req.params;
        const userEmail = req.user.email; // Assuming user email is available through auth middleware

        // Find the team by ID
        const team = await FormingTeam.findById(teamId);

        if (!team) {
            return res.status(404).json({ message: 'Team not found' });
        }

        // Check if the current user is the team leader (using email)
        if (team.TeamleaderEmailID !== userEmail) {
            return res.status(403).json({ message: 'Only the team leader can remove members' });
        }

        // Find the member in the team
        const memberIndex = team.members.findIndex(member => member._id.toString() === memberId);

        if (memberIndex === -1) {
            return res.status(404).json({ message: 'Member not found in the team' });
        }

        // Remove the member from the team
        team.members.splice(memberIndex, 1);

        // Save the updated team document
        await team.save();

        res.status(200).json({ message: 'Member removed successfully', team });
    } catch (error) {
        console.error('Error removing member from the team:', error);
        res.status(500).json({ message: 'An error occurred while removing the team member' });
    }
});

//for a member to leave the team.......
router.put('/team/:teamId/member/:memberId/leave', authMiddleware, async (req, res) => {
    try {
        const { teamId, memberId } = req.params;

        const team = await FormingTeam.findById(teamId);
        if (!team) {
            return res.status(404).json({ message: 'Team not found' });
        }

        // Find the team member by memberId
        const memberIndex = team.members.findIndex(member => member._id.toString() === memberId);
        if (memberIndex === -1) {
            return res.status(404).json({ message: 'Member not found in the team' });
        }

        // Remove the member from the team
        team.members.splice(memberIndex, 1);
        await team.save();

        res.json({ message: 'You have successfully left the team' });
    } catch (error) {
        console.error('Error leaving team:', error.message);
        res.status(500).json({ message: 'An error occurred while leaving the team' });
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



/////// For Join a Team!!!!!!!  ////////////
//To get invitations from different teams
router.get('/invited', authMiddleware, async (req, res) => {
    try {
        const userId = req.user._id; // Assuming user's ID is available via auth middleware

        // Fetch all forming teams where the user is in the pendingInvites array
        const teams = await FormingTeam.find({ 
            'pendingInvites.userId': userId ,
            'pendingInvites.status': 'PENDING',
            'pendingInvites.type': 'SENT'
        }).lean();

        res.json({ invitedTeams: teams });
    } catch (error) {
        console.error('Error fetching invited teams:', error);
        res.status(500).json({ message: 'An error occurred while fetching invited teams' });
    }
});

//Get teams...
router.get('/cluster/:cluster/:program', authMiddleware, async (req, res) => {
    try {
        const { cluster, program } = req.params; // Extract cluster and program from req.params
        const maxProgramLimit = 3; // Maximum allowed members from the same program

        // Fetch all forming teams in the specified cluster
        const teams = await FormingTeam.find({ cluster }).lean();

        const eligibleTeams = teams.filter(team => {
            const totalMembers = team.members.length + 1; // Include the leader
            const programCount = team.members.filter(m => m.program === program).length
                + (team.TeamleaderProgram === program ? 1 : 0); // Include the leader's program

            return (
                totalMembers < 5 && // Team must have open spots
                programCount < maxProgramLimit // Team must not exceed program constraints
            );
        });

        res.json({ eligibleTeams });
    } catch (error) {
        console.error('Error fetching eligible teams:', error);
        res.status(500).json({ message: 'An error occurred while fetching eligible teams' });
    }
});


// Apply for a team
router.post('/:teamId/apply', authMiddleware, async (req, res) => {
    try {
        const { teamId } = req.params; // Extract the team ID from the route parameter
        const userId = req.user._id; // User ID from authMiddleware
        const { position } = req.body; // Position the student is applying for

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

        // Check if the position is already filled
        if (team.members.some(m => m.position === position)) {
            return res.status(400).json({ message: 'The position you are applying for is already filled' });
        }

        // Add the application to the pendingInvites array with type set to 'APPLIED'
        team.pendingInvites.push({
            email: req.user.email, // From authMiddleware
            program: req.user.program, // From authMiddleware
            position,
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

//For Team Lead To accept or reject the requestToJoinTeam
router.put('/handle/:teamId/:inviteId', authMiddleware, async (req, res) => {
    const { status, position } = req.body; // Include position in the request body

    try {
        // Find the team by ID
        const team = await FormingTeam.findById(req.params.teamId);
        if (!team) {
            return res.status(404).json({ message: 'Team not found' });
        }

        // Verify the team leader
        if (team.TeamleaderEmailID !== req.user.email) {
            return res.status(403).json({ message: 'Only the team leader can handle applications' });
        }

        // Find the invite in the pendingInvites array
        const invite = team.pendingInvites.find(
            invite => invite._id.toString() === req.params.inviteId
        );
        if (!invite) {
            return res.status(404).json({ message: 'Invite not found' });
        }

        // Update invite status
        invite.status = status;

        if (status === 'ACCEPTED') {
            // Ensure a valid position is provided
            if (!position) {
                return res.status(400).json({ message: 'Position must be specified when accepting an invite' });
            }

            // Check if the position is already filled
            const isPositionTaken = team.members.some(member => member.position === position);
            if (isPositionTaken) {
                return res.status(400).json({ message: `The position '${position}' is already filled` });
            }

            // Check if team has space for more members
            if (team.members.length >= 5) {
                return res.status(400).json({ message: 'Team already has the maximum number of members' });
            }

            // Add the accepted member to the team
            team.members.push({
                name: invite.name || 'Unknown', // Handle undefined name
                email: invite.email,
                position, // Assigned position
                joinedAt: new Date()
            });

            // Remove the invite from pendingInvites
            team.pendingInvites = team.pendingInvites.filter(
                invite => invite._id.toString() !== req.params.inviteId
            );
        }

        await team.save();

        res.json({ message: `Invite ${status.toLowerCase()} successfully` });
    } catch (error) {
        console.error('Error handling invite:', error.message, error.stack);
        res.status(500).json({ message: 'An error occurred while handling the invite' });
    }
});

// To cancel the Sent application
router.delete('/team/:teamId/application/:applicationId/cancel', authMiddleware, async (req, res) => {
    try {
        const { teamId, applicationId } = req.params;

        const team = await FormingTeam.findById(teamId);
        if (!team) {
            return res.status(404).json({ message: 'Team not found' });
        }

        // Find the application in the pendingInvites array by applicationId
        const inviteIndex = team.pendingInvites.findIndex(invite => invite._id.toString() === applicationId);
        if (inviteIndex === -1) {
            return res.status(404).json({ message: 'Application not found' });
        }

        // Remove the application from the pendingInvites array
        team.pendingInvites.splice(inviteIndex, 1);
        await team.save();

        res.json({ message: 'Application successfully canceled' });
    } catch (error) {
        console.error('Error canceling application:', error.message);
        res.status(500).json({ message: 'An error occurred while canceling the application' });
    }
});



module.exports = router;
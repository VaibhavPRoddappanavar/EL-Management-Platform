// Routes/teamSearchRoutes.js
const express = require('express');
const router = express.Router();
const FormingTeam = require('../Models/FormingTeam');
const Team = require('../Models/Team');
const authMiddleware = require('../middleware/authenticateToken');

// Get all teams looking for members with filtering options
router.get('/available-teams', authMiddleware, async (req, res) => {
    try {
        const {
            cluster,
            program,
            page = 1,
            limit = 10,
            theme
        } = req.query;

        // Base query - teams in FORMING status
        let query = {
            status: 'FORMING'
        };

        // Add filters if provided
        if (cluster) {
            query.cluster = cluster;
        }

        if (theme) {
            query.Theme = new RegExp(theme, 'i'); // Case-insensitive theme search
        }

        // Find teams that have at least one empty position
        query.$or = [
            { TeamMember1EmailID: { $exists: false } },
            { TeamMember1EmailID: "" },
            { TeamMember2EmailId: { $exists: false } },
            { TeamMember2EmailId: "" },
            { TeamMember3EmailID: { $exists: false } },
            { TeamMember3EmailID: "" },
            { TeamMember4EmailID: { $exists: false } },
            { TeamMember4EmailID: "" }
        ];

        // Exclude teams where the user is already a member or has pending applications/invites
        const userEmail = req.user.email;
        query.$and = [
            { TeamleaderEmailID: { $ne: userEmail } },
            { TeamMember1EmailID: { $ne: userEmail } },
            { TeamMember2EmailId: { $ne: userEmail } },
            { TeamMember3EmailID: { $ne: userEmail } },
            { TeamMember4EmailID: { $ne: userEmail } },
            { 'pendingInvites.email': { $ne: userEmail } }
        ];

        // If program filter is provided, ensure team's cluster matches the program's cluster
        if (program) {
            const programClusterMap = {
                'AI': 'CS', 'CD': 'CS', 'CS': 'CS', 'CY': 'CS', 'IS': 'CS',
                'EC': 'EC', 'EE': 'EC', 'EI': 'EC', 'ET': 'EC',
                'AS': 'ME', 'IM': 'ME', 'ME': 'ME',
                'CV': 'CV', 'BT': 'CV', 'CH': 'CV'
            };
            
            const userCluster = programClusterMap[program];
            if (userCluster) {
                query.cluster = userCluster;
            }
        }

        // Execute query with pagination
        const totalTeams = await FormingTeam.countDocuments(query);
        const teams = await FormingTeam.find(query)
            .select([
                'TeamLeaderName',
                'TeamleaderProgram',
                'Theme',
                'cluster',
                'status',
                'TeamMember1Program',
                'TeamMember2Program',
                'TeamMember3Program',
                'TeamMember4Program',
                'createdAt'
            ])
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(limit);

        // For each team, calculate and add available positions
        const teamsWithPositions = teams.map(team => {
            const availablePositions = [];
            
            if (!team.TeamMember1Program) availablePositions.push('TeamMember1');
            if (!team.TeamMember2Program) availablePositions.push('TeamMember2');
            if (!team.TeamMember3Program) availablePositions.push('TeamMember3');
            if (!team.TeamMember4Program) availablePositions.push('TeamMember4');

            return {
                ...team.toObject(),
                availablePositions,
                totalPositions: availablePositions.length
            };
        });

        res.json({
            teams: teamsWithPositions,
            pagination: {
                currentPage: page,
                totalPages: Math.ceil(totalTeams / limit),
                totalTeams,
                hasMore: page * limit < totalTeams
            }
        });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get detailed team information for a specific team
router.get('/team-details/:teamId', authMiddleware, async (req, res) => {
    try {
        const team = await FormingTeam.findById(req.params.teamId)
            .select([
                'TeamLeaderName',
                'TeamleaderProgram',
                'Theme',
                'cluster',
                'status',
                'TeamMember1Name',
                'TeamMember1Program',
                'TeamMember2Name',
                'TeamMember2Program',
                'TeamMember3Name',
                'TeamMember3Program',
                'TeamMember4Name',
                'TeamMember4Program',
                'createdAt'
            ]);

        if (!team) {
            return res.status(404).json({ message: 'Team not found' });
        }

        // Check if user has any pending applications or invites
        const hasPendingApplication = await TeamApplication.findOne({
            teamId: req.params.teamId,
            applicantEmail: req.user.email,
            status: 'PENDING'
        });

        const hasPendingInvite = team.pendingInvites.some(
            invite => invite.email === req.user.email && invite.status === 'PENDING'
        );

        // Calculate available positions
        const availablePositions = [];
        if (!team.TeamMember1Name) availablePositions.push('TeamMember1');
        if (!team.TeamMember2Name) availablePositions.push('TeamMember2');
        if (!team.TeamMember3Name) availablePositions.push('TeamMember3');
        if (!team.TeamMember4Name) availablePositions.push('TeamMember4');

        res.json({
            team: {
                ...team.toObject(),
                availablePositions,
                totalPositions: availablePositions.length
            },
            userStatus: {
                hasPendingApplication: !!hasPendingApplication,
                hasPendingInvite,
                canApply: !hasPendingApplication && !hasPendingInvite
            }
        });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get teams statistics
router.get('/statistics', async (req, res) => {
    try {
        const stats = await FormingTeam.aggregate([
            {
                $group: {
                    _id: null,
                    totalTeams: { $sum: 1 },
                    formingTeams: {
                        $sum: { $cond: [{ $eq: ['$status', 'FORMING'] }, 1, 0] }
                    },
                    submittedTeams: {
                        $sum: { $cond: [{ $eq: ['$status', 'SUBMITTED'] }, 1, 0] }
                    },
                    clusterStats: {
                        $push: {
                            cluster: '$cluster',
                            status: '$status'
                        }
                    }
                }
            }
        ]);

        // Process cluster statistics
        const clusterStats = stats[0].clusterStats.reduce((acc, curr) => {
            if (!acc[curr.cluster]) {
                acc[curr.cluster] = {
                    total: 0,
                    forming: 0,
                    submitted: 0
                };
            }
            acc[curr.cluster].total += 1;
            if (curr.status === 'FORMING') acc[curr.cluster].forming += 1;
            if (curr.status === 'SUBMITTED') acc[curr.cluster].submitted += 1;
            return acc;
        }, {});

        res.json({
            totalTeams: stats[0].totalTeams,
            formingTeams: stats[0].formingTeams,
            submittedTeams: stats[0].submittedTeams,
            clusterStats
        });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
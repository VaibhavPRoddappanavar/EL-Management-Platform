// Models/FormingTeam.js
const mongoose = require('mongoose');

// Define cluster programs (same as before)
const clusterPrograms = {
    CS: ['AI', 'CD', 'CS', 'CY', 'IS'],
    EC: ['EC', 'EE', 'EI', 'ET'],
    ME: ['AE', 'IM', 'ME'],
    CV: ['CV', 'BT', 'CH']
};

const formingTeamSchema = new mongoose.Schema({
    TeamLeaderUSN: {
        type: String,
        required: true
    },
    TeamLeaderName: {
        type: String,
        required: true
    },
    TeamleaderEmailID: {
        type: String,
        required: true
    },
    TeamleaderMobileNumber: {
        type: String,
        required: true
    },
    TeamleaderProgram: {
        type: String,
        required: true
    },
    Theme: {
        type: String,
        required: true
    },
    members: [{
        name: String,
        usn: String,
        email: String,
        mobileNumber: String,
        program: String,
        position: String,
        joinedAt: {
            type: Date,
            default: Date.now
        }
    }],
    pendingInvites: [
        {
            email: String,
            program: String,
            position: String,
            status: { type: String, default: 'PENDING' }, // PENDING, ACCEPTED, REJECTED
            type: { type: String, enum: ['SENT', 'APPLIED'], required: true } // SENT or APPLIED
        }
    ],
    cluster: {
        type: String,
        required: true,
        enum: Object.keys(clusterPrograms)
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    expiresAt: {
        type: Date,
        default: () => new Date(+new Date() + 70*24*60*60*1000) // 7 days from creation
    }
});



// Validation method
formingTeamSchema.methods.validateTeamComposition = async function() {
    const allMembers = [
        {
            program: this.TeamleaderProgram,
            email: this.TeamleaderEmailID,
            usn: this.TeamLeaderUSN
        },
        ...this.members.map(member => ({
            program: member.program,
            email: member.email,
            usn: member.usn
        }))
    ];

    // 1. Check if any member is in an existing team
    for (const member of allMembers) {
        const existingTeam = await mongoose.model('Team').findOne({
            $or: [
                { TeamleaderEmailID: member.email },
                { TeamMember1EmailID: member.email },
                { TeamMember2EmailId: member.email },
                { TeamMember3EmailID: member.email },
                { TeamMember4EmailID: member.email }
            ]
        });

        if (existingTeam) {
            return { 
                isValid: false, 
                error: `${member.email} is already part of a registered team.` 
            };
        }
    }

    // 2. Check cluster program validity
    const allowedPrograms = clusterPrograms[this.cluster];
    if (!allowedPrograms) {
        return { isValid: false, error: 'Invalid cluster specified.' };
    }

    const invalidPrograms = allMembers.filter(member => 
        !allowedPrograms.includes(member.program)
    );

    if (invalidPrograms.length > 0) {
        return { 
            isValid: false, 
            error: 'All members must belong to programs within the same cluster.' 
        };
    }

    // 3. Check for duplicate USNs
    const usns = allMembers.map(member => member.usn);
    const uniqueUsns = new Set(usns);
    if (uniqueUsns.size !== usns.length) {
        return { 
            isValid: false, 
            error: 'Duplicate USNs detected. Each member must be unique.' 
        };
    }

    // 4. Check maximum members from same program
    const programCounts = {};
    allMembers.forEach(member => {
        programCounts[member.program] = (programCounts[member.program] || 0) + 1;
    });

    if (Object.values(programCounts).some(count => count > 3)) {
        return { 
            isValid: false, 
            error: 'Maximum 3 members allowed from the same program.' 
        };
    }

    // 5. Check minimum programs requirement
    if (Object.keys(programCounts).length < 2) {
        return { 
            isValid: false, 
            error: 'Team must have members from at least 2 distinct programs.' 
        };
    }

    return { isValid: true };
};

// Convert to final team model
formingTeamSchema.methods.convertToFinalTeam = function() {
    const finalTeam = {
        TeamLeaderUSN: this.TeamLeaderUSN,
        TeamLeaderName: this.TeamLeaderName,
        TeamleaderEmailID: this.TeamleaderEmailID,
        TeamleaderMobileNumber: this.TeamleaderMobileNumber,
        TeamleaderProgram: this.TeamleaderProgram,
        Theme: this.Theme,
        cluster: this.cluster,
        status: 'COMPLETE'
    };

    // Map members to their positions
    this.members.forEach(member => {
        const position = member.position;
        finalTeam[`${position}USN`] = member.usn;
        finalTeam[`${position}Name`] = member.name;
        finalTeam[`${position}EmailID`] = member.email;
        finalTeam[`${position}MobileNumber`] = member.mobileNumber;
        finalTeam[`${position}Program`] = member.program;
    });

    return finalTeam;
};

const FormingTeam = mongoose.model('FormingTeam', formingTeamSchema);

module.exports = { FormingTeam, clusterPrograms };

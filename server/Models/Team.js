const mongoose = require('mongoose');

const TeamSchema = new mongoose.Schema({
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
    Teammember1USN: {
        type: String,
        required: true
    },
    TeamMember1Name: {
        type: String,
        required: true
    },
    TeamMember1EmailID: {
        type: String,
        required: true
    },
    TeamMember1MobileNumber: {
        type: String,
        required: true
    },
    TeamMember1Program: {
        type: String,
        required: true
    },
    Teammember2USN: {
        type: String
    },
    TeamMember2Name: {
        type: String
    },
    TeamMember2EmailId: {
        type: String
    },
    TeamMember2MobileNumber: {
        type: String
    },
    TeamMember2Program: {
        type: String
    },
    Teammember3USN: {
        type: String
    },
    TeamMember3Name: {
        type: String
    },
    TeamMember3EmailID: {
        type: String
    },
    TeamMember3MobileNumber: {
        type: String
    },
    TeamMember3Program: {
        type: String
    },
    Teammember4USN: {
        type: String
    },
    TeamMember4Name: {
        type: String
    },
    TeamMember4EmailID: {
        type: String
    },
    TeamMember4MobileNumber: {
        type: String
    },
    TeamMember4Program: {
        type: String
    }
});

const Team = mongoose.model('Team', TeamSchema);
module.exports = Team;

// Models/TeamApplication.js
const mongoose = require('mongoose');

const teamApplicationSchema = new mongoose.Schema({
    teamId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Team',
        required: true
    },
    applicantEmail: {
        type: String,
        required: true
    },
    applicantName: {
        type: String,
        required: true
    },
    applicantProgram: {
        type: String,
        required: true
    },
    applicantUSN: {
        type: String,
        required: true
    },
    status: {
        type: String,
        enum: ['PENDING', 'ACCEPTED', 'REJECTED', 'WITHDRAWN'],
        default: 'PENDING'
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('TeamApplication', teamApplicationSchema);
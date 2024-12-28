const mongoose = require('mongoose');

const studentMarkSchema = new mongoose.Schema({
    studentEmail: {
        type: String,
        required: true
    },
    studentName: String,
    studentUSN: String,
    marks: {
        type: Number,
        required: true
    },
    individualFeedback: String
});

const marksSchema = new mongoose.Schema({
    teamId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Team',
        required: true
    },
    phase: {
        type: String,
        enum: ['Phase1', 'Phase2', 'Phase3'],
        required: true
    },
    studentMarks: [studentMarkSchema],
    generalFeedback: String,
    submittedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'TeacherProfile',
        required: true
    },
    submittedAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Marks', marksSchema); 
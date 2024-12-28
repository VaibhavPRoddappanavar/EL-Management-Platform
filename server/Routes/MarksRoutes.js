const express = require('express');
const router = express.Router();
const Marks = require('../Models/Marks');
const teacherAuth = require('../middleware/teacherAuth');

// Add or update marks
router.post('/submit', teacherAuth, async (req, res) => {
    try {
        const { teamId, phase, studentMarks, generalFeedback } = req.body;
        
        // Validate input
        if (!teamId || !phase || !studentMarks || !Array.isArray(studentMarks)) {
            return res.status(400).json({ message: 'Invalid input data' });
        }

        // Find existing marks document or create new one
        let marksDoc = await Marks.findOne({ 
            teamId, 
            phase,
            submittedBy: req.teacher._id 
        });
        
        if (!marksDoc) {
            marksDoc = new Marks({
                teamId,
                phase,
                submittedBy: req.teacher._id
            });
        }

        // Update marks
        marksDoc.studentMarks = studentMarks;
        marksDoc.generalFeedback = generalFeedback;
        marksDoc.submittedAt = new Date();
        
        await marksDoc.save();
        res.status(200).json({ 
            message: 'Marks submitted successfully',
            data: marksDoc 
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get marks for a team
router.get('/team/:teamId', teacherAuth, async (req, res) => {
    try {
        const marks = await Marks.find({ 
            teamId: req.params.teamId,
            submittedBy: req.teacher._id 
        }).sort({ submittedAt: -1 });
        res.status(200).json(marks);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get marks for a specific student
router.get('/student/:studentEmail', teacherAuth, async (req, res) => {
    try {
        const marks = await Marks.find({
            'studentMarks.studentEmail': req.params.studentEmail,
            submittedBy: req.teacher._id
        }).sort({ submittedAt: -1 });
        res.status(200).json(marks);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get marks by phase
router.get('/phase/:phase', teacherAuth, async (req, res) => {
    try {
        const marks = await Marks.find({
            phase: req.params.phase,
            submittedBy: req.teacher._id
        }).populate('teamId').sort({ submittedAt: -1 });
        res.status(200).json(marks);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Update marks for a specific submission
router.put('/update/:markId', teacherAuth, async (req, res) => {
    try {
        const { studentMarks, generalFeedback } = req.body;
        
        const mark = await Marks.findOne({
            _id: req.params.markId,
            submittedBy: req.teacher._id
        });

        if (!mark) {
            return res.status(404).json({ message: 'Marks record not found' });
        }

        mark.studentMarks = studentMarks;
        mark.generalFeedback = generalFeedback;
        mark.submittedAt = new Date();

        await mark.save();
        res.json({ 
            message: 'Marks updated successfully',
            data: mark 
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router; 
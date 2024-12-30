const express = require('express');
const router = express.Router();
const Marks = require('../Models/Marks');
const teacherAuth = require('../middleware/teacherAuth');
const verifyToken = require('../middleware/Admin/authMiddleware');

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

// Get cumulative marks for all students (Admin only)
router.get('/cumulative', verifyToken, async (req, res) => {
    try {
        // Get all marks grouped by team and student
        const marks = await Marks.find({})
            .populate('teamId', 'TeamLeaderName TeamleaderEmailID TeamLeaderUSN TeamMember1Name TeamMember1EmailID TeamMember1USN TeamMember2Name TeamMember2EmailID TeamMember2USN TeamMember3Name TeamMember3EmailID TeamMember3USN TeamMember4Name TeamMember4EmailID TeamMember4USN Theme')
            .lean();

        // Process marks to calculate cumulative scores
        const studentMarks = {};

        marks.forEach(mark => {
            if (!mark.teamId) {
                console.log('Warning: Mark record without team:', mark);
                return;
            }

            mark.studentMarks.forEach(student => {
                const key = student.studentEmail;
                if (!studentMarks[key]) {
                    studentMarks[key] = {
                        email: student.studentEmail,
                        name: student.studentName,
                        usn: student.studentUSN,
                        team: mark.teamId.Theme,
                        phases: {
                            Phase1: 0,
                            Phase2: 0,
                            Phase3: 0
                        },
                        cumulative: {
                            Phase1: 0,
                            Phase2: 0,
                            Phase3: 0
                        }
                    };
                }
                
                // Store individual phase marks
                studentMarks[key].phases[mark.phase] = student.marks;
                
                // Calculate cumulative marks
                if (mark.phase === 'Phase1') {
                    studentMarks[key].cumulative.Phase1 = student.marks;
                } else if (mark.phase === 'Phase2') {
                    // Phase 2 marks = Phase 2 actual marks - Phase 1 marks
                    studentMarks[key].cumulative.Phase2 = student.marks;
                } else if (mark.phase === 'Phase3') {
                    // Phase 3 marks = Phase 3 actual marks - Phase 2 marks
                    studentMarks[key].cumulative.Phase3 = student.marks;
                }
            });
        });

        // Convert to array and calculate actual phase-wise marks
        const finalMarks = Object.values(studentMarks).map(student => {
            const phase1Marks = student.phases.Phase1 || 0;
            const phase2Total = student.phases.Phase2 || 0;
            const phase3Total = student.phases.Phase3 || 0;

            // Calculate individual phase marks, ensuring no negative values
            const phase2Individual = Math.max(0, phase2Total - phase1Marks);
            const phase3Individual = Math.max(0, phase3Total - phase2Total);

            return {
                ...student,
                phaseWise: {
                    Phase1: phase1Marks,
                    Phase2: phase2Individual,
                    Phase3: phase3Individual
                },
                total: phase3Total || phase2Total || phase1Marks || 0
            };
        });

        res.json(finalMarks);
    } catch (error) {
        console.error('Error fetching cumulative marks:', error);
        res.status(500).json({ message: 'Error fetching marks', error: error.message });
    }
});

module.exports = router;
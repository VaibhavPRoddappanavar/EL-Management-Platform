const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const Faculty = require('../../Models/TeachersModels/facultyinfo');

// Teacher Login Route
router.post('/login', async (req, res) => {
    console.log('Login request received:', req.body);
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
        return res.status(400).json({ 
            message: 'Email and password are required',
            received: { email: !!email, password: !!password }
        });
    }

    try {
        // Find teacher by email
        const teacher = await Faculty.findOne({ email }).select('+password');
        console.log('Teacher found:', teacher ? 'Yes' : 'No');
        
        if (!teacher) {
            return res.status(400).json({ message: 'Invalid email or password.' });
        }

        // Log the actual hashed password from DB
        console.log('Stored hashed password in DB:', teacher.password);
        console.log('Attempting to compare with password:', password);

        // Verify password
        const validPassword = await bcrypt.compare(password, teacher.password);
        console.log('Password comparison result:', validPassword);

        if (!validPassword) {
            return res.status(400).json({ message: 'Invalid email or password.' });
        }

        // Create and assign token
        const token = jwt.sign(
            { 
                id: teacher._id,
                email: teacher.email,
                name: teacher.name,
                designation: teacher.designation
            },
            process.env.JWT_SECRET || 'your-fallback-secret-key',
            { expiresIn: '1d' }
        );

        res.json({
            message: 'Login successful',
            token,
            teacher: {
                id: teacher._id,
                name: teacher.name,
                email: teacher.email,
                designation: teacher.designation
            }
        });

    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: 'Server error during login.' });
    }
});

module.exports = router;

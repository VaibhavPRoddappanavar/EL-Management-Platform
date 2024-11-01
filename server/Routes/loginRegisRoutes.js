const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const Student = require('../Models/Student');  // Student schema for registration and login
const Team = require('../Models/Team');  // Team schema to check if a student is part of a team

const loadEmailList = require('../Models/EmailLoader');

// Load the email list once when the module is loaded
const emailList = loadEmailList();


// Registration Route
router.post('/register', async (req, res) => {
    const { name, email, password, confirmPassword } = req.body;

    // Check if the email exists in the email list
    if (!emailList.includes(email)) {
        return res.status(400).json({ message: 'Email does not exist in the student list.' });
    }

    // Check if passwords match
    if (password !== confirmPassword) {
        return res.status(400).json({ message: 'Passwords do not match.' });
    }

    // Extract branch from the email (substring between the first dot and two digits before '@')
    const match = email.match(/\.(\w+)\d{2}@/);
    const branch = match ? match[1] : null; // Get the matched branch or set to null if no match

    try {
        // Check if the student already exists
        const existingStudent = await Student.findOne({ email });
        if (existingStudent) {
            return res.status(400).json({ message: 'Student with this email already exists.' });
        }

        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create a new student
        const student = new Student({
            name,
            branch,
            email,
            password: hashedPassword
        });

        // Save the student in the database
        await student.save();

        res.json({ message: 'Registration successful. You can now log in.' });
    } catch (error) {
        console.error('Error occurred during registration:', error);
        res.status(500).json({ message: 'Server error', error });
    }
});

// Login Route
router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    // Check for the correct email domain
    if (!email.endsWith('@rvce.edu.in')) {
        return res.status(400).json({ message: 'Invalid email ID. Only rvce.edu.in accounts are allowed.' });
    }

    try {
        // Check if the student exists
        const student = await Student.findOne({ email });
        if (!student) {
            return res.status(400).json({ message: 'Invalid email or password.' });
        }

        // Verify password
        const validPassword = await bcrypt.compare(password, student.password);
        if (!validPassword) {
            return res.status(400).json({ message: 'Invalid email or password.' });
        }

        // Check if the student is part of any team
        const teamMember = await Team.findOne({
            $or: [
                { TeamleaderEmailID: email.trim() },
                { TeamMember1EmailID: email.trim() },
                { TeamMember2EmailId: email.trim() },
                { TeamMember3EmailID: email.trim() },
                { TeamMember4EmailID: email.trim() },
            ]
        });

        // Create a token for the user, including team ID if they are in a team
        const token = jwt.sign(
            { email, teamId: teamMember ? teamMember._id : null },
            'your_jwt_secret_key',
            { expiresIn: '1h' }
        );

        // Send response with token and team status
        res.json({
            message: 'Login successful',
            token,
            teamExists: !!teamMember  // true if part of a team, false if not
        });
    } catch (error) {
        console.error('Error occurred during login:', error);
        res.status(500).json({ message: 'Server error', error });
    }
});

module.exports = router;

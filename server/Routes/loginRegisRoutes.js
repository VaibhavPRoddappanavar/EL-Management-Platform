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

    // Validate email ends with @rvce.edu.in
    if (!email.endsWith('@rvce.edu.in')) {
        return res.status(400).json({ message: 'Invalid email ID. Only rvce.edu.in accounts are allowed.' });
    }

    try {
        // Check if the student exists
        const student = await Student.findOne({ email });
        if (!student) {
            return res.status(400).json({ message: 'Invalid email or password.' });
        }

        // Compare the provided password with the stored hashed password
        const validPassword = await bcrypt.compare(password, student.password);
        if (!validPassword) {
            return res.status(400).json({ message: 'Invalid email or password.' });
        }

        // Look for the team using the email
        const teamMember = await Team.findOne({
            $or: [
                { TeamleaderEmailID: email.trim() },
                { TeamMember1EmailID: email.trim() },
                { TeamMember2EmailId: email.trim() },
                { TeamMember3EmailID: email.trim() },
                { TeamMember4EmailID: email.trim() },
            ]
        });

        if (!teamMember) {
            return res.status(404).json({ message: 'Team not found. You are not part of any team.' });
        }

        // Create a JWT token (for authorization in future requests)
        const token = jwt.sign(
            { email, teamId: teamMember._id },  // Use the team _id for further requests
            'your_jwt_secret', 
            { expiresIn: '1h' }
        );

        // Structure response to include team details
        res.json({
            message: 'Login successful',
            token,
            teamDetails: {
                teamId: teamMember._id,
                theme:teamMember.Theme,
                teamLeader: {
                    name: teamMember.TeamLeaderName,
                    email: teamMember.TeamleaderEmailID,
                    mobile: teamMember.TeamleaderMobileNumber,
                },
                teamMembers: [
                    {
                        name: teamMember.TeamMember1Name,
                        email: teamMember.TeamMember1EmailID,
                        mobile: teamMember.TeamMember1MobileNumber,
                        program: teamMember.TeamMember1Program,
                    },
                    {
                        name: teamMember.TeamMember2Name,
                        email: teamMember.TeamMember2EmailId,
                        mobile: teamMember.TeamMember2MobileNumber,
                        program: teamMember.TeamMember2Program,
                    },
                    {
                        name: teamMember.TeamMember3Name,
                        email: teamMember.TeamMember3EmailID,
                        mobile: teamMember.TeamMember3MobileNumber,
                        program: teamMember.TeamMember3Program,
                    },
                    {
                        name: teamMember.TeamMember4Name,
                        email: teamMember.TeamMember4EmailID,
                        mobile: teamMember.TeamMember4MobileNumber,
                        program: teamMember.TeamMember4Program,
                    },
                ].filter(member => member.name)  // Filter out empty members
            }
        });
    } catch (error) {
        console.error('Error occurred during login:', error);
        res.status(500).json({ message: 'Server error', error });
    }
});

module.exports = router;

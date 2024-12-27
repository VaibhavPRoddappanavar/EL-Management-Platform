const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const TeacherProfile = require('../../Models/TeachersModels/TeacherProfile');

// Teacher Login Route
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Find teacher by email
    const teacher = await TeacherProfile.findOne({ email });
    if (!teacher) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Verify password
    const validPassword = await bcrypt.compare(password, teacher.password);
    if (!validPassword) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Generate JWT token
    const token = jwt.sign(
      { id: teacher._id, email: teacher.email },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    // Send response without password
    const teacherData = {
      id: teacher._id,
      name: teacher.name,
      email: teacher.email,
      department: teacher.department,
      designation: teacher.designation
    };

    res.json({ token, teacher: teacherData });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error during login' });
  }
});

// Get Teacher Profile
router.get('/profile', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ message: 'No token provided' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const teacher = await TeacherProfile.findById(decoded.id)
      .select('-password')
      .populate('assignedTeams');

    if (!teacher) {
      return res.status(404).json({ message: 'Teacher not found' });
    }

    res.json(teacher);
  } catch (error) {
    console.error('Profile fetch error:', error);
    res.status(500).json({ message: 'Server error while fetching profile' });
  }
});

module.exports = router;

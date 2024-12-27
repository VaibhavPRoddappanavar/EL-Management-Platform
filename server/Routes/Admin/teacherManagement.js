const express = require('express');
const router = express.Router();
const TeacherProfile = require('../../Models/TeachersModels/TeacherProfile');
const Team = require('../../Models/Team');
const bcrypt = require('bcrypt');
const path = require('path');
const fs = require('fs');

// Register new teacher
router.post('/register-teacher', async (req, res) => {
  try {
    const { name, email, department, designation, password } = req.body;

    // Check if teacher already exists
    const existingTeacher = await TeacherProfile.findOne({ email });
    if (existingTeacher) {
      return res.status(400).json({ message: 'Teacher already exists' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new teacher
    const teacher = new TeacherProfile({
      name,
      email,
      department,
      designation,
      password: hashedPassword
    });

    await teacher.save();
    res.status(201).json({ message: 'Teacher registered successfully' });
  } catch (error) {
    console.error('Error registering teacher:', error);
    res.status(500).json({ message: 'Error registering teacher' });
  }
});

// Assign teams to teacher
router.post('/assign-teams', async (req, res) => {
  try {
    const { teacherId, teamIds } = req.body;

    // Validate number of teams (max 4)
    if (teamIds.length > 4) {
      return res.status(400).json({ message: 'Maximum 4 teams can be assigned to a teacher' });
    }

    // Update teacher's assigned teams
    const teacher = await TeacherProfile.findByIdAndUpdate(
      teacherId,
      { assignedTeams: teamIds },
      { new: true }
    ).populate('assignedTeams');

    if (!teacher) {
      return res.status(404).json({ message: 'Teacher not found' });
    }

    res.json({ message: 'Teams assigned successfully', teacher });
  } catch (error) {
    console.error('Error assigning teams:', error);
    res.status(500).json({ message: 'Error assigning teams' });
  }
});

// Get all teachers with their assigned teams
router.get('/teachers', async (req, res) => {
  try {
    const teachers = await TeacherProfile.find()
      .select('-password')
      .populate('assignedTeams');
    res.json(teachers);
  } catch (error) {
    console.error('Error fetching teachers:', error);
    res.status(500).json({ message: 'Error fetching teachers' });
  }
});

// Add this new route to get CSE faculty data
router.get('/cse-faculty', async (req, res) => {
  try {
    const dataPath = path.join(__dirname, '../../Data/TeachersData/data.json');
    const jsonData = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
    res.json(jsonData['CSE faculty']);
  } catch (error) {
    console.error('Error fetching CSE faculty:', error);
    res.status(500).json({ message: 'Error fetching faculty data' });
  }
});

// Add this new route to get unassigned teams
router.get('/unassigned-teams', async (req, res) => {
  try {
    // Get all teams
    const allTeams = await Team.find();
    
    // Get all teachers with their assigned teams
    const teachers = await TeacherProfile.find().select('assignedTeams');
    
    // Create a Set of assigned team IDs
    const assignedTeamIds = new Set();
    teachers.forEach(teacher => {
      teacher.assignedTeams.forEach(teamId => {
        assignedTeamIds.add(teamId.toString());
      });
    });

    // Filter out teams that are already assigned
    const unassignedTeams = allTeams.filter(team => 
      !assignedTeamIds.has(team._id.toString())
    );

    res.json(unassignedTeams);
  } catch (error) {
    console.error('Error fetching unassigned teams:', error);
    res.status(500).json({ message: 'Error fetching unassigned teams' });
  }
});

module.exports = router; 
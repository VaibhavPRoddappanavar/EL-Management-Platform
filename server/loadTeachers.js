const mongoose = require('mongoose');
const TeacherProfile = require('./Models/TeachersModels/TeacherProfile');
const bcrypt = require('bcrypt');
const path = require('path');
const fs = require('fs');
require('dotenv').config();
const connectDB = require("./db");

const loadTeachers = async () => {
  try {
    // Connect to MongoDB
    await connectDB();
    console.log('Connected to MongoDB');

    // Read the data.json file
    const dataPath = path.join(__dirname, './Data/TeachersData/data.json');
    const jsonData = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
    const teachers = jsonData['CSE faculty'];

    console.log(`Found ${teachers.length} teachers in data.json`);

    // Clear existing teachers
    await TeacherProfile.deleteMany({});
    console.log('Cleared existing teachers');

    // Process and insert all teachers
    const teacherPromises = teachers.map(async (teacher) => {
      const hashedPassword = await bcrypt.hash(teacher.password, 10);
      return new TeacherProfile({
        name: teacher.name,
        email: teacher.email,
        department: 'CSE',
        designation: teacher.designation,
        password: hashedPassword,
        assignedTeams: [],
        createdAt: new Date()
      });
    });

    const teacherDocs = await Promise.all(teacherPromises);
    await TeacherProfile.insertMany(teacherDocs);

    console.log('Successfully loaded all teachers');
    process.exit(0);
  } catch (error) {
    console.error('Error loading teachers:', error);
    process.exit(1);
  }
};

// Run the function
loadTeachers(); 
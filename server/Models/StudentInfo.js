const mongoose = require('mongoose');

// Student schema
const studentSchema = new mongoose.Schema({
    DEPARTMENT: { type: String, required: true },
    USN: { type: String, required: true, unique: true },
    Name: { type: String, required: true },
    email: { type: String, required: true, unique: true }
});

// Department schema containing students array
const departmentSchema = new mongoose.Schema({
    departmentCode: { type: String, required: true, unique: true }, // e.g., 'AI', 'AE'
    students: [studentSchema] // Embed array of students
});

// Create a model for departments
const Department = mongoose.model('Department', departmentSchema);

module.exports = Department;

// Import necessary modules
require("dotenv").config(); // Load environment variables
const path = require('path');
const mongoose = require('mongoose');
const connectDB = require('./db'); // Import the database connection function
const Department = require('./Models/StudentInfo'); // Import the Department model
const fs = require('fs');

// Connect to MongoDB
connectDB();

// Load JSON data from the file
const data = JSON.parse(fs.readFileSync('./Data/AuthorisedStudentsData.json', 'utf-8'));

// Function to insert data into MongoDB
const saveData = async () => {
    try {
        // Clear existing data in the Department collection
        await Department.deleteMany({});

        for (const [departmentCode, students] of Object.entries(data)) {
            // Create a department document with an array of student documents
            const department = new Department({
                departmentCode: departmentCode,
                students: students.map(student => ({
                    DEPARTMENT: student.DEPARTMENT,
                    USN: student.USN, // Adjusted field names based on JSON format
                    Name: student.Name,
                    email: student.email
                }))
            });

            // Save each department with its students
            await department.save();
        }
        console.log('Data inserted successfully');
    } catch (error) {
        console.error("Error inserting data:", error);
    } finally {
        mongoose.disconnect(); // Close the connection once done
    }
};

// Call the saveData function
saveData();

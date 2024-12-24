const fs = require("fs");
const path = require("path");
const mongoose = require("mongoose");
const bcrypt = require('bcrypt');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });
const Faculty = require("./facultyinfo");
const connectDB = require("../../db");

// Connect to the database
connectDB();

const seedFacultyData = async () => {
  try {
    // Read and parse faculty data
    const rawData = fs.readFileSync(
      path.join(__dirname, "../../Data/TeachersData/data.json"),
      "utf-8"
    );
    const jsonData = JSON.parse(rawData);
    const facultyData = jsonData["CSE faculty"]; // Extract the faculty array

    if (!facultyData || !Array.isArray(facultyData)) {
      throw new Error("Invalid faculty data format");
    }

    // Log parsed data to debug
    console.log("Number of faculty records to seed:", facultyData.length);

    // Clear existing data
    await Faculty.deleteMany({});

    // Hash passwords and prepare faculty data
    const hashedFacultyData = await Promise.all(facultyData.map(async (faculty) => {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(faculty.password, salt);
      return { ...faculty, password: hashedPassword };
    }));

    // Insert data into the database
    await Faculty.insertMany(hashedFacultyData);
    console.log("Faculty data seeded successfully with hashed passwords.");
  } catch (error) {
    console.error("Error seeding faculty data:", error);
  } finally {
    mongoose.connection.close();
  }
};

// Run the seed function
seedFacultyData();

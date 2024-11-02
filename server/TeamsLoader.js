require('dotenv').config();
const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
const Team = require('./Models/Team');
const connectDB = require('./db');

const insertTeams = async () => {
    try {
        // Connect to the database
        await connectDB();
        console.log("Database connected successfully");

        // Clear existing data in the Team collection
        await Team.deleteMany({});
        console.log("Existing data cleared");

        // Load and parse data from the JSON file
        const teamsData = JSON.parse(fs.readFileSync(path.join(__dirname, './Data/actualData.json'), 'utf-8'));

        // Insert data into the collection
        await Team.insertMany(teamsData);
        console.log('Teams data successfully inserted');

        // Verification: Query all teams and log them
        const allTeams = await Team.find();
        console.log('Inserted teams:', allTeams);

    } catch (error) {
        console.error('Error inserting teams data:', error);
    } finally {
        // Close the database connection
        mongoose.connection.close(() => {
            console.log('Database connection closed');
        });
    }
};

// Execute the function
insertTeams();
// console.log("Database URI:", process.env.MONGODB_URI);

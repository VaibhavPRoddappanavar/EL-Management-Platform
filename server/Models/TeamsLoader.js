const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
const Team = require('./Team'); 
const connectDB = require('../db');


connectDB();
const teamsData = JSON.parse(fs.readFileSync(path.join(__dirname, '../Data/actualData.json'), 'utf-8'));

const insertTeams = async () => {
    try {
        await Team.insertMany(teamsData);
        console.log('Teams data successfully inserted');

        // Verification: Query all teams and log them
        const allTeams = await Team.find();
        console.log('Inserted teams:', allTeams);

    } catch (error) {
        console.error('Error inserting teams data:', error);
    } finally {
        mongoose.connection.close();
    }
};

insertTeams();

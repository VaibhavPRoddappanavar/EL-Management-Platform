const mongoose = require('mongoose');

// Define the schema for CSE Faculty
const facultySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  designation: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true, // Ensures no duplicate email IDs
  },
  password: {
    type: String,
    required: true,
  },
});

// Create the model for the schema
const Faculty = mongoose.model('Faculty', facultySchema);

module.exports = Faculty;

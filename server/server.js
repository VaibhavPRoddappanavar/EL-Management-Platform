require("dotenv").config();

const Team = require("./Models/Team");
const express = require("express");
const app = express();
const connectDB = require("./db");
const PasswordChange = require("./Routes/PasswordChange");
const loginRegisRoutes = require("./Routes/loginRegisRoutes");
const teamCreate=require("./Routes/CreateTeam");
const teamDRoutes = require("./Routes/TeamDisplay");
const loadEmailList = require("./Models/EmailLoader");
const cors = require('cors');
const TeamRoutes=require("./Routes/TeamRoutes");
const Student=require("./Models/Student");

// Enable CORS for requests from http://localhost:3000
app.use(cors({ origin: 'http://localhost:3000' }));

// Import admin routes
const adminRoutes = require("./Routes/Admin/adminlogin"); // Update the path as necessary

// Example usage
const emailList = loadEmailList();
// console.log(emailList); // Display the loaded email list

const PORT = 5000;

// Middleware to parse JSON requests
app.use(express.json());

// Middleware for password changes
app.use("/Password", PasswordChange);

// Middleware for student login/registration
app.use("/student", loginRegisRoutes);

// Middleware for team-related routes
app.use("/teams", teamDRoutes);

//Middleware for team creation
app.use("/team",teamCreate);

// Middleware for admin routes
app.use("/admin", adminRoutes); // Connect admin routes

// TeamRoutes
app.use("/",TeamRoutes);

//to fetch student details...
app.get('/student-details', async (req, res) => {
  const email = req.query.email;
  if (!email) {
    return res.status(400).json({ message: 'Email is required' });
  }
  try {
    const student = await Student.findOne({ email }); // Replace with your DB logic
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }
    res.json(student);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});


connectDB();


// Test route to get all teams
app.get('/api/teams', async (req, res) => {
    try {
        const teams = await Team.find(); // Fetch all teams from the database
        res.json(teams);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

app.get("/", (req, res) => {
  res.send("Server is running...");
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

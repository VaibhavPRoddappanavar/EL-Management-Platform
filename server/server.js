require("dotenv").config();

const Team = require("./Models/Team");
const express = require("express");
const app = express();
const connectDB = require("./db");
const PasswordChange = require("./Routes/PasswordChange");
const loginRegisRoutes = require("./Routes/loginRegisRoutes");
const teamRoutes = require("./Routes/team");
const loadEmailList = require("./Models/EmailLoader");

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
app.use("/teams", teamRoutes);

// Middleware for admin routes
app.use("/admin", adminRoutes); // Connect admin routes

connectDB();

// Test route to add/post a team
app.post("/api/teams", async (req, res) => {
  const { name, email, teamId, role, branch } = req.body;

  const newTeam = new Team({
    name,
    email,
    teamId,
    role,
    branch,
  });

  try {
    const savedTeam = await newTeam.save(); // Save to MongoDB
    res.status(201).json(savedTeam);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});
//route to get all teams
app.get("/api/teams", async (req, res) => {
  try {
    const teams = await Team.find();
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
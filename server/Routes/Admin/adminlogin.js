// File: Routes/Admin/adminlogin.js
const express = require("express");
const jwt = require("jsonwebtoken");
const Admin = require("../../Models/AdminModels/Admin"); // Adjust the path if necessary
const Team = require("../../Models/Team"); // Import the Team model
const verifyToken = require("../../middleware/Admin/authMiddleware"); // Import your auth middleware
const router = express.Router();

// Login route
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  // Check admin credentials
  const admin = await Admin.findOne({ email });
  if (!admin || admin.password !== password) {
    return res.status(401).json({ message: "Invalid email or password" });
  }

  // Generate JWT token with fixed secret key
  const token = jwt.sign({ email }, process.env.JWT_SECRET, {
    expiresIn: "30m",
  });

  res.json({ token }); // Send back the token
});

// Route to get teams sorted by theme
router.get("/teams", verifyToken, async (req, res) => {
  const theme = req.query.theme; // Get theme from query parameter

  try {
    // Fetch teams from the database
    const teams = await Team.find(); // Get all teams

    if (theme) {
      // Filter teams by the specified theme
      const filteredTeams = teams.filter((team) => team.Theme === theme);
      return res.json(filteredTeams);
    }

    return res.json(teams); // Return all teams if no theme specified
  } catch (error) {
    console.error("Error fetching teams:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
});

module.exports = router;

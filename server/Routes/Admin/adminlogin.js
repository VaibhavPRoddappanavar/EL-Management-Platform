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

  // Generate JWT token with fixed secret key
  const token = jwt.sign({ password }, process.env.password, {
    expiresIn: "30m",
  });

  res.json({ token }); // Send back the token
});

// Route to get teams sorted by theme
router.get("/teams", verifyToken, async (req, res) => {
  const theme = req.query.theme; // Get theme from query parameter

  if (!token) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    res.status(403).json({ message: "Invalid token" });
  }
});

module.exports = router;

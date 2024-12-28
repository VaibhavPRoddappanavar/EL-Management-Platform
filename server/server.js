require("dotenv").config();

const Team = require("./Models/Team");
const express = require("express");
const http = require("http"); // Required for Socket.IO
const { Server } = require("socket.io"); // Import Socket.IO
const connectDB = require("./db");
const PasswordChange = require("./Routes/PasswordChange");
const loginRegisRoutes = require("./Routes/loginRegisRoutes");
const teamCreate = require("./Routes/CreateTeam");
const teamDRoutes = require("./Routes/TeamDisplay");
const loadEmailList = require("./Models/EmailLoader");
const cors = require("cors");
const TeamRoutes = require("./Routes/TeamRoutes");
const StudentInfo = require("./Models/StudentInfo");
const Chat = require("./Models/Chatmodel");
const teacherAuth = require("./Routes/Teachers/teacherAuth");
const marksManagement = require('./Routes/Teachers/marksManagement');
const teacherManagement = require('./Routes/Admin/teacherManagement');
const marksRoutes = require('./Routes/MarksRoutes');

const app = express();
const server = http.createServer(app); // Create HTTP server for Socket.IO
const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000", // Adjust to your frontend URL
    methods: ["GET", "POST"],
  },
});

// Enable CORS for requests from http://localhost:3000
app.use(cors({ origin: "http://localhost:3000" }));

// Import admin routes
const adminRoutes = require("./Routes/Admin/adminlogin");
const notInTeamRoutes = require("./Routes/Admin/notinteam");
const Teammanagement = require("./Routes/Admin/Teammanagement");

// Example usage
const emailList = loadEmailList();

const PORT = 5000;

// Middleware to parse JSON requests
app.use(express.json());

// Middleware for password changes
app.use("/Password", PasswordChange);

// Middleware for student login/registration
app.use("/student", loginRegisRoutes);

// Middleware for teacher authentication
app.use("/teacher", teacherAuth);

// Middleware for team-related routes
app.use("/teams", teamDRoutes);

// Middleware for team creation
app.use("/team", teamCreate);

// Middleware for admin routes
app.use("/admin", adminRoutes);
app.use("/admin", notInTeamRoutes);
app.use("/admin/teams", Teammanagement);

// TeamRoutes
app.use("/", TeamRoutes);

// Middleware for marks management
app.use("/api/marks", marksRoutes);

// Teacher routes
app.use('/api/teachers', teacherAuth);

// Middleware for teacher marks management
app.use("/api/teachers/marks", marksManagement);

// Middleware for admin teacher management
app.use('/api/admin/teachers', teacherManagement);

// Add this route to handle student details fetch
app.get("/student-details", async (req, res) => {
  try {
    const { email } = req.query;
    
    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    // First, try to find the student in any department
    const departments = await StudentInfo.find();
    let foundStudent = null;

    // Search through all departments
    for (const dept of departments) {
      const student = dept.students.find(s => s.email === email);
      if (student) {
        foundStudent = {
          ...student.toObject(),
          departmentCode: dept.departmentCode
        };
        break;
      }
    }

    if (!foundStudent) {
      return res.status(404).json({ message: "Student not found" });
    }

    res.json(foundStudent);
  } catch (error) {
    console.error("Error fetching student details:", error);
    res.status(500).json({ message: "Server error while fetching student details" });
  }
});

// Database connection
connectDB();

// Socket.io server
io.on("connection", (socket) => {
  console.log("A user connected:", socket.id);

  // User joins a team chat room
  socket.on("joinTeam", async (teamId) => {
    socket.join(teamId);
    console.log(`User ${socket.id} joined room: ${teamId}`);

    try {
      // Fetch previous messages from the database
      const previousMessages = await Chat.find({ teamId }).sort({
        timestamp: 1,
      });
      socket.emit("previousMessages", previousMessages); // Send previous messages to the client
    } catch (error) {
      console.error("Error fetching messages:", error.message);
    }
  });

  // Handle new chat messages
  socket.on("sendMessage", async (data) => {
    const { teamId, sender, message } = data;

    try {
      // Save message to the database
      const chatMessage = new Chat({
        teamId,
        sender,
        message,
        timestamp: new Date(),
      });
      await chatMessage.save();

      // Broadcast the message to everyone in the team
      io.to(teamId).emit("receiveMessage", {
        sender,
        message,
        timestamp: chatMessage.timestamp,
      });
    } catch (error) {
      console.error("Error saving message:", error.message);
    }
  });

  // Handle user disconnect
  socket.on("disconnect", () => {
    console.log("A user disconnected:", socket.id);
  });
});

// Test route to get all teams - open endpoint
app.get("/api/teams", async (req, res) => {
  try {
    const teams = await Team.find();
    res.json(teams);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Protected teacher route to fetch teams
app.get("/teacher/teams", async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ message: "No token provided" });
    }

    const { theme } = req.query;
    let query = {};
    if (theme && theme !== "All Teams") {
      query.Theme = theme;
    }

    const teams = await Team.find(query);
    console.log('Fetched teams for teacher:', teams.length, 'Theme:', theme);
    res.json(teams);
  } catch (error) {
    console.error('Error in /teacher/teams:', error);
    res.status(500).json({ message: error.message });
  }
});

// Protected teacher route to fetch unassigned students
app.get("/teacher/unassigned", async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ message: "No token provided" });
    }

    const includedDepartments = ["AI", "CS", "CD", "CY", "IS"];

    // Fetch students from departments
    const departments = await StudentInfo.find({
      departmentCode: { $in: includedDepartments },
    });

    const allStudents = departments.flatMap((dept) =>
      dept.students.map((student) => ({
        ...student.toObject(),
        departmentCode: dept.departmentCode,
      }))
    );

    // Debug: Check if students are fetched correctly
    console.log("All Students:", allStudents.length);

    // Fetch all emails of students already in teams
    const teams = await Team.find({});
    const teamEmails = new Set(
      teams.flatMap((team) => [
        team.TeamleaderEmailID,
        team.TeamMember1EmailID,
        team.TeamMember2EmailID,
        team.TeamMember3EmailID,
        team.TeamMember4EmailID,
      ]).filter(Boolean) // Remove null/undefined values
    );

    // Debug: Check the set of emails
    console.log("Team Emails:", teamEmails.size);

    // Filter out students whose email is already in a team
    const unassignedStudents = allStudents.filter(
      (student) => !teamEmails.has(student.email)
    );

    // Debug: Check the unassigned students
    console.log("Unassigned Students:", unassignedStudents.length);

    res.json(unassignedStudents);
  } catch (error) {
    console.error('Error in /teacher/unassigned:', error);
    res.status(500).json({ message: error.message });
  }
});

// Admin route to fetch all teams
app.get("/admin/teams", async (req, res) => {
  try {
    const teams = await Team.find();
    res.status(200).json(teams);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Test server endpoint
app.get("/", (req, res) => {
  res.send("Server is running...");
});

// Start the server
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log('Available routes:');
  console.log('- GET /teacher/unassigned');
  console.log('- GET /teacher/teams');
  console.log('- GET /api/teams');
});

// Marks routes
app.use('/marks', marksRoutes);

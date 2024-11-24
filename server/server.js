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
const Student = require("./Models/Student");
const Chat = require("./Models/Chatmodel");

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

// Fetch student details
app.get("/student-details", async (req, res) => {
  const email = req.query.email;
  if (!email) {
    return res.status(400).json({ message: "Email is required" });
  }
  try {
    const student = await Student.findOne({ email });
    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }
    res.json(student);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
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

// Test route to get all teams
app.get("/api/teams", async (req, res) => {
  try {
    const teams = await Team.find(); // Fetch all teams from the database
    res.json(teams);
  } catch (error) {
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
});

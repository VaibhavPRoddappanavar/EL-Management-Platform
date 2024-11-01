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

connectDB();

// Test route to add/post a team
// app.post('/api/teams', async (req, res) => {
//     const {
//         TeamLeaderUSN,
//         TeamLeaderName,
//         TeamleaderEmailID,
//         TeamleaderMobileNumber,
//         TeamleaderProgram,
//         Theme,
//         Teammember1USN,
//         TeamMember1Name,
//         TeamMember1EmailID,
//         TeamMember1MobileNumber,
//         TeamMember1Program,
//         Teammember2USN,
//         TeamMember2Name,
//         TeamMember2EmailId,
//         TeamMember2MobileNumber,
//         TeamMember2Program,
//         Teammember3USN,
//         TeamMember3Name,
//         TeamMember3EmailID,
//         TeamMember3MobileNumber,
//         TeamMember3Program,
//         Teammember4USN,
//         TeamMember4Name,
//         TeamMember4EmailID,
//         TeamMember4MobileNumber,
//         TeamMember4Program
//     } = req.body;

//     // Creating a new team document using the provided fields
//     const newTeam = new Team({
//         TeamLeaderUSN,
//         TeamLeaderName,
//         TeamleaderEmailID,
//         TeamleaderMobileNumber,
//         TeamleaderProgram,
//         Theme,
//         Teammember1USN,
//         TeamMember1Name,
//         TeamMember1EmailID,
//         TeamMember1MobileNumber,
//         TeamMember1Program,
//         Teammember2USN,
//         TeamMember2Name,
//         TeamMember2EmailId,
//         TeamMember2MobileNumber,
//         TeamMember2Program,
//         Teammember3USN,
//         TeamMember3Name,
//         TeamMember3EmailID,
//         TeamMember3MobileNumber,
//         TeamMember3Program,
//         Teammember4USN,
//         TeamMember4Name,
//         TeamMember4EmailID,
//         TeamMember4MobileNumber,
//         TeamMember4Program
//     });

//     try {
//         // Save the new team to MongoDB
//         const savedTeam = await newTeam.save();
//         res.status(201).json(savedTeam);
//     } catch (error) {
//         res.status(400).json({ message: error.message });
//     }
// });


// // Route to insert excel to json converted data
// app.post('/add-sample-data', async (req, res) => {
//     try {
//         const sampleData = req.body; // The sample data will come from the request body
//         const result = await Team.insertMany(sampleData.Sheet1); // Insert multiple documents
//         res.status(201).json({ message: 'Data inserted successfully', data: result });
//     } catch (error) {
//         res.status(500).json({ message: 'Error inserting data', error: error.message });
//     }
// });


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

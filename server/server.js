const Team = require('./Models/Team');
const express=require('express');
const app=express();
const connectDB = require('./db');
const PasswordChange=require('./Routes/PasswordChange');
const loginRegisRoutes=require('./Routes/loginRegisRoutes');
const teamRoutes = require('./Routes/team');
const loadEmailList = require('./Models/EmailLoader');

// Example usage
const emailList = loadEmailList();
//console.log(emailList); // Display the loaded email list

const PORT=5000;

// app.use(cors());
// app.use(bodyParser.json());

// Middleware to parse JSON requests
app.use(express.json());

//Middleware for password changes
app.use('/Password', PasswordChange);

//Middleware for studentlogin/registration
app.use('/student', loginRegisRoutes);

//for viewing teams
app.use('/teams', teamRoutes);

connectDB();

//Test route to add/post a team
app.post('/api/teams', async (req, res) => {
    const { name, email, teamId, role, branch } = req.body;

    const newTeam = new Team({
        name,
        email,
        teamId,
        role,
        branch
    });

    try {
        const savedTeam = await newTeam.save(); // Save to MongoDB
        res.status(201).json(savedTeam);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});


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

app.get('/',(req,res)=>{
    res.send('Server is running...');
});

app.listen(PORT,()=>{
    console.log(`Server is running on port ${PORT}`);
});


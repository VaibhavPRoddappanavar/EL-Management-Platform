🏫 EL Management System
A web platform designed to streamline the Experiential Learning (EL) project workflow in colleges by simplifying team formation, mentor assignment, and admin supervision.

🔧 Tech Stack
Frontend: React (MUI, Tailwind CSS)

Backend: Node.js, Express.js

Database: MongoDB

Other Tools: JWT for authentication, REST APIs

🧩 Features
👨‍🎓 Student Layer
Register and log in as a student.

Form teams of 4 or 5 students.

Cross-department team formation allowed.

Submit finalized teams.

View team details and status.

👩‍🏫 Teacher Layer
Log in as a faculty mentor.

View teams assigned to you.

Access team member details.

Accept or give feedback on teams (if applicable).

👨‍💼 Admin Layer
Secure admin login.

View all teams and users (students + teachers).

Assign teachers to student teams.

Theme-based team filtering (e.g., by project domain).

Manage user data and team assignments.

🌐 Project Structure
bash
Copy
Edit
EL-Management-Platform/
│
├── client/ # React frontend
│ ├── src/
│ │ ├── components/
│ │ ├── pages/
│ │ └── ...
│
├── server/ # Express backend
│ ├── models/
│ ├── routes/
│ ├── controllers/
│ └── ...
│
└── README.md
🚀 Setup Instructions
Clone the repository

bash
Copy
Edit
git clone https://github.com/<your-username>/EL-Management-Platform.git
cd EL-Management-Platform
Set up the frontend

bash
Copy
Edit
cd client
npm install
npm start
Set up the backend

bash
Copy
Edit
cd server
npm install
npm run dev
Environment Variables
Create a .env file inside /server and set:

ini
Copy
Edit
PORT=5000
MONGO_URI=<your-mongodb-uri>
JWT_SECRET=<your-secret-key>
📊 Real Data Integration
This platform is built using real student and team data from our institution’s EL project submissions, ensuring a practical and usable product tailored to actual academic workflows.

🧠 Learnings & Highlights
Built complete multi-user role-based system.

Implemented team management across departments.

Integrated mentor assignment workflows.

Learned state management, API integration, and modular frontend/backend development.

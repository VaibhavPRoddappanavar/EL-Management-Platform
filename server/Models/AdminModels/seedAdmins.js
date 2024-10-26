// modules/seedAdmins.js
const fs = require("fs");
const path = require("path");
const mongoose = require("mongoose");
const Admin = require("./Admin");
const connectDB = require("../../db");

// Connect to the database
connectDB();

const seedAdminData = async () => {
  try {
    const rawData = fs.readFileSync(
      path.join(__dirname, "../../Data/AdminData/AdminCredentials.json"),
      "utf-8"
    );
    const adminCredentials = JSON.parse(rawData);

    await Admin.insertMany(adminCredentials);
    console.log("Admin data seeded successfully.");
  } catch (error) {
    console.error("Error seeding admin data:", error);
  } finally {
    mongoose.connection.close();
  }
};

seedAdminData();

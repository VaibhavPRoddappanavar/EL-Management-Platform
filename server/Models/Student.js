const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema({
    name: { type: String, required: true },
    branch: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    resetPasswordToken: { type: String },            // Field to store the reset token
    resetPasswordExpires: { type: Date }             // Field to store the token expiration
});

const Student = mongoose.model('Student', studentSchema);
module.exports = Student;

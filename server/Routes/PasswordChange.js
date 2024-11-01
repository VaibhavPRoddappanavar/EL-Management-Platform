
const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const Student = require('../Models/Student');
//for Forgot password
const crypto = require('crypto');
const nodemailer = require('nodemailer');

// Change Password Route (User knows the old password)
router.post('/change-password', async (req, res) => {
    const { email, oldPassword, newPassword } = req.body;

    try {
        // Step 1: Find the student by email
        const student = await Student.findOne({ email });
        if (!student) {
            return res.status(400).json({ message: 'Student not found.' });
        }

        // Step 2: Verify the old password
        const validPassword = await bcrypt.compare(oldPassword, student.password);
        if (!validPassword) {
            return res.status(400).json({ message: 'Old password is incorrect.' });
        }

        // Step 3: Hash the new password and update it
        const salt = await bcrypt.genSalt(10);
        student.password = await bcrypt.hash(newPassword, salt);
        await student.save();

        res.json({ message: 'Password changed successfully.' });

    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
});

// Route to request a password reset
router.post('/forgot-password', async (req, res) => {
    const { email } = req.body;

    try {
        // Step 1: Check if the student exists
        const student = await Student.findOne({ email });
        if (!student) {
            return res.status(400).json({ message: 'Student not found.' });
        }

        // Step 2: Generate a reset token
        const resetToken = crypto.randomBytes(32).toString('hex');

        // Step 3: Set token expiration (e.g., 1 hour from now)
        student.resetPasswordToken = resetToken;
        student.resetPasswordExpires = Date.now() + 3600000; // 1 hour
        await student.save();

        // Step 4: Send an email with the reset link
        const transporter = nodemailer.createTransport({
            service: 'Gmail', // Or any other email provider you use
            auth: {
                user: 'vaitesticle@gmail.com',  // Your email
                pass: 'kvchxrxnreotewmj',   // Your email password
            },
        });

        const resetUrl = `http://localhost:3000/reset-password/${resetToken}`;
        const mailOptions = {
            to: email,
            from: 'vaitesticle@gmail.com',
            subject: 'Password Reset Request',
            text: `You requested a password reset. Click the link to reset your password: ${resetUrl}`
        };

        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                return res.status(500).json({ message: 'Failed to send email', error });
            }
            res.json({ message: 'Password reset email sent successfully.' });
        });

    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
});

// Route to reset the password using the reset token
router.post('/reset-password/:token', async (req, res) => {
    const { token } = req.params;
    const { newPassword } = req.body;

    try {
        // Step 1: Find the student with the valid reset token and check if it's not expired
        const student = await Student.findOne({
            resetPasswordToken: token,
            resetPasswordExpires: { $gt: Date.now() } // Check if token is still valid
        });

        if (!student) {
            return res.status(400).json({ message: 'Invalid or expired token.' });
        }

        // Step 2: Hash the new password and save it
        const salt = await bcrypt.genSalt(10);
        student.password = await bcrypt.hash(newPassword, salt);
        
        // Step 3: Clear the reset token and expiration date
        student.resetPasswordToken = undefined;
        student.resetPasswordExpires = undefined;
        await student.save();

        res.json({ message: 'Password reset successful.' });

    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
});


module.exports = router;

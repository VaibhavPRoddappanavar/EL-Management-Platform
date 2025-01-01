const jwt = require('jsonwebtoken');

// Middleware to verify JWT token
const authenticateToken = (req, res, next) => {
    const token = req.header('Authorization')?.split(' ')[1];  // Expected format: "Bearer <token>"

    if (!token) {
        return res.status(401).json({ message: 'Access denied. No token provided.' });
    }

    try {
        // Verify token using the same secret as in teacherAuth.js
        const verified = jwt.verify(token, process.env.JWT_SECRET);
        req.user = verified;  // Attach the user info to the request
        next();  // Proceed to the next middleware/route handler
    } catch (error) {
        console.error('Token verification error:', error);
        res.status(400).json({ message: 'Invalid token.' });
    }
};

module.exports = authenticateToken;

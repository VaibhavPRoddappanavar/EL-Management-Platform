const jwt = require('jsonwebtoken');

// JWT Secret (should match the one in your login route)
const JWT_SECRET = 'your_jwt_secret_key';

// Middleware to verify JWT token
const authenticateToken = (req, res, next) => {
    const token = req.header('Authorization')?.split(' ')[1];  // Expected format: "Bearer <token>"

    if (!token) {
        return res.status(401).json({ message: 'Access denied. No token provided.' });
    }

    try {
        // Verify token
        const verified = jwt.verify(token, JWT_SECRET);
        req.user = verified;  // Attach the user info to the request
        next();  // Proceed to the next middleware/route handler
    } catch (error) {
        res.status(400).json({ message: 'Invalid token.' });
    }
};

module.exports = authenticateToken;

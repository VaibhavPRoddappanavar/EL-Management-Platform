const jwt = require('jsonwebtoken');
const TeacherProfile = require('../Models/TeachersModels/TeacherProfile');

const teacherAuth = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const teacher = await TeacherProfile.findById(decoded.id);
    
    if (!teacher) {
      return res.status(401).json({ message: 'Invalid authentication' });
    }

    req.teacher = teacher;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Invalid authentication' });
  }
};

module.exports = teacherAuth; 
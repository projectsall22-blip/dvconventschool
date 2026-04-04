const jwt = require('jsonwebtoken');
const Admin = require('../models/Admin');
const Teacher = require('../models/Teacher');
const Student = require('../models/Student');

// Protect routes — verify JWT and attach user to req
const protect = async (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ message: 'Not authorized, no token' });
    }

    const token = authHeader.split(' ')[1];

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        const userMap = {
            admin:   () => Admin.findById(decoded.id).select('-password'),
            teacher: () => Teacher.findById(decoded.id).select('-password'),
            student: () => Student.findById(decoded.id).select('-password'),
        };

        const fetchUser = userMap[decoded.role];
        if (!fetchUser) {
            return res.status(401).json({ message: 'Invalid token role' });
        }

        const user = await fetchUser();
        if (!user) {
            return res.status(401).json({ message: 'User no longer exists' });
        }

        req.user = user;
        req.user.role = decoded.role; // ensure role is always available
        next();
    } catch (error) {
        // Pass JWT errors to global error handler for consistent messages
        next(error);
    }
};

// Restrict access by role
const authorize = (...roles) => {
    return (req, res, next) => {
        if (!req.user || !roles.includes(req.user.role)) {
            return res.status(403).json({
                message: `Role '${req.user?.role}' is not authorized to access this route`,
            });
        }
        next();
    };
};

module.exports = { protect, authorize };

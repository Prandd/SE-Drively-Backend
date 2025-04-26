const jwt = require('jsonwebtoken');
const User = require('../models/user');

// @desc Protect routes
// @access Private
exports.protect = async (req, res, next) => {
    let token;

    try {
        console.log("Protect middleware reached");
        // Check if token exists in cookies or headers
        if (req.cookies.token) {
            token = req.cookies.token;
            console.log("Token found in cookies:", token); // Log token if found in cookies
        } else if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
            token = req.headers.authorization.split(' ')[1];
            console.log("Token found in headers:", token); // Log token if found in headers
        }

        // Ensure token exists
        if (!token) {
            return res.status(401).json({
                success: false,
                error: 'Not authorized, no token provided'
            });
        }

        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        console.log("Decoded Token:", decoded); // Log the decoded token for debugging

        // Find user in the database
        const user = await User.findById(decoded.userId);
        if (!user) {
            return res.status(401).json({
                success: false,
                error: 'Not authorized, user not found'
            });
        }

        // Attach user to the request object
        req.user = user;
        next();
    } catch (error) {
        console.error("Authentication Error:", error); // Log errors
        return res.status(401).json({
            success: false,
            error: 'Not authorized, invalid or expired token'
        });
    }
};

// @desc Grant access to specific roles
// @access Private
exports.authorize = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            return res.status(403).json({
                success: false,
                error: `User role ${req.user.role} is not authorized to access this route`
            });
        }
        next();
    };
};

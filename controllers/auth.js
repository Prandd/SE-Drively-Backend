const User = require('../models/user');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

// Helper function to get token from model, create cookie, and send response
const sendTokenResponse = (user, statusCode, res) => {
    const token = user.getSignedJwtToken();
    
    // Cookie options
    const options = {
        expires: new Date(Date.now() + process.env.JWT_COOKIE_EXPIRE * 24 * 60 * 60 * 1000),
        httpOnly: true
    };

    if (process.env.NODE_ENV === 'production') {
        options.secure = true;
    }

    res.status(statusCode)
        .cookie('token', token, options)
        .json({
            success: true,
            token
        });
};

// ✅ Register User
// @route  POST /api/v1/auth/register
// @access Public
exports.register = async (req, res) => {
    try {
        const { name, email, password, telephoneNumber, role = 'user', driverLicense } = req.body;

        if (!name || !email || !password || !telephoneNumber) {
            return res.status(400).json({ success: false, message: "All fields are required" });
        }

        // Check if user exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ success: false, message: "User already exists" });
        }

        // Create user data object
        const userData = {
            name,
            email,
            password,
            telephoneNumber,
            role
        };

        // Add driverLicense if provided
        if (driverLicense) {
            userData.driverLicense = driverLicense;
        }

        // Create new user
        const user = await User.create(userData);

        sendTokenResponse(user, 201, res);
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: "Server error" });
    }
};

// ✅ Login User
// @route  POST /api/v1/auth/login
// @access Public
exports.login = async (req, res) => {
    const { email, password } = req.body;

    // Validate email and password
    if (!email || !password) {
        return res.status(400).json({ success: false, message: "Please provide an email and password" });
    }

    // Check for user
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
        return res.status(401).json({ success: false, message: "Invalid credentials" });
    }

    // Check if password matches
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
        return res.status(401).json({ success: false, message: "Invalid credentials" });
    }

    sendTokenResponse(user, 200, res);
};

// ✅ Get Current Logged-In User
// @route  GET /api/v1/auth/me
// @access Private
exports.getMe = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        res.status(200).json({ success: true, data: user });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: "Server error" });
    }
};

// ✅ Logout User & Clear Cookie
// @route  POST /api/v1/auth/logout  (Changed from GET to POST)
// @access Private
exports.logout = (req, res) => {
    try {
        res.clearCookie('token');  // Clear the token from cookies
        res.status(200).json({ success: true, data: null, message: 'User logged out successfully' });
    } catch (error) {
        console.error('Logout Error:', error);
        res.status(500).json({ success: false, data: null, error: 'Server Error' });
    }
};

// @desc    Update user profile
// @route   PUT /api/v1/auth/updateprofile
// @access  Private
exports.updateProfile = async (req, res) => {
    try {
        const { name, email, telephoneNumber, password, driverLicense } = req.body;
        
        const updateFields = {};
        if (name) updateFields.name = name;
        if (email) updateFields.email = email;
        if (telephoneNumber) updateFields.telephoneNumber = telephoneNumber;
        if (driverLicense) updateFields.driverLicense = driverLicense;

        // Handle password update separately
        if (password) {
            const salt = await bcrypt.genSalt(10);
            updateFields.password = await bcrypt.hash(password, salt);
        }

        const user = await User.findByIdAndUpdate(
            req.user._id,
            { $set: updateFields },
            { new: true, runValidators: true }
        );

        res.status(200).json({
            success: true,
            data: user
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            error: error.message
        });
    }
};

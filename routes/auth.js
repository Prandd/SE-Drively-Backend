const express = require('express');
const {
    register,
    login,
    logout,
    getMe,
    updateProfile,
    getAllUsers
} = require('../controllers/auth');

const router = express.Router();

const { protect } = require('../middleware/auth');

// Routes for register, login, and logout
router.post('/register', register);
router.post('/login', login);
router.post('/logout', logout);
router.get('/me', protect, getMe);
router.put('/updateprofile', protect, updateProfile);
router.get('/allusers', protect, getAllUsers); // Admin only

module.exports = router;

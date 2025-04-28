const express = require('express');
const {
    register,
    login,
    logout,
    getMe,
    updateProfile,
    getAllUsers,
    adminUpdateUser
} = require('../controllers/auth');

const router = express.Router();

const { protect, authorize } = require('../middleware/auth');

// Routes for register, login, and logout
router.post('/register', register);
router.post('/login', login);
router.post('/logout', logout);
router.get('/me', protect, getMe);
router.put('/updateprofile', protect, updateProfile);
router.get('/allusers', protect,authorize('admin'), getAllUsers); 
router.put('/user/:id', protect, authorize('admin'), adminUpdateUser);

module.exports = router;

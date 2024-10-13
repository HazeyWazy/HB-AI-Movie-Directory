const express = require('express');
const { register, login, logout, uploadProfilePicture, getProfilePicture } = require('../controllers/authController');
const authenticateToken = require('../middleware/authenticateToken'); // Import middleware
const router = express.Router();
const multer = require('multer');
const upload = require('../server')


router.post('/register', register);
router.post('/login', login);
router.post('/logout', authenticateToken, logout); // Protect logout route
// Route to upload a profile picture (POST)
// router.post('/profile-picture', authenticateToken, upload('profilePicture'), uploadProfilePicture);

// // Route to serve profile picture (GET)
// router.get('/profile-picture/:filename', authenticateToken, getProfilePicture);

module.exports = router;

// Profile Routes: Manages user profile operations
const express = require('express');
const { getProfile, updateProfile, uploadProfilePicture } = require('../controllers/profileController');
const authenticateToken = require('../middleware/authenticateToken');
const { upload } = require('../config/cloudinary');

const router = express.Router();

// All routes require authentication
router.get('/profile', authenticateToken, getProfile);        // Get user profile
router.put('/profile', authenticateToken, updateProfile);     // Update profile information
router.post('/profile/picture', authenticateToken, 
  upload.single('profilePicture'),                           // Handle image upload
  uploadProfilePicture);                                     // Update profile picture

module.exports = router;
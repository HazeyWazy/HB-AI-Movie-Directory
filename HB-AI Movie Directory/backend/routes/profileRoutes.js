const express = require('express');
const { getProfile, updateProfile, uploadProfilePicture } = require('../controllers/profileController');
const authenticateToken = require('../middleware/authenticateToken');
const { upload } = require('../config/cloudinary');

const router = express.Router();

router.get('/profile', authenticateToken, getProfile);
router.put('/profile', authenticateToken, updateProfile);
router.post('/profile/picture', authenticateToken, upload.single('profilePicture'), uploadProfilePicture);

module.exports = router;
const express = require('express');
const { getProfile, updateProfile, uploadProfilePicture } = require('../controllers/profileController');
const authenticateToken = require('../middleware/authenticateToken');
const multer = require('multer');
const path = require('path');

const router = express.Router();

// Configure multer for file upload
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/') // Make sure this directory exists
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname)) // Appending extension
  }
});

const upload = multer({ storage: storage });

router.get('/profile', authenticateToken, getProfile);
router.put('/profile', authenticateToken, updateProfile);
router.post('/profile/picture', authenticateToken, upload.single('profilePicture'), uploadProfilePicture);

module.exports = router;
// Auth Routes: Handles authentication endpoints
const express = require('express');
const { register, login, logout, getUserInfo} = require('../controllers/authController');
const authenticateToken = require('../middleware/authenticateToken'); 
const router = express.Router();

// Public routes
router.post('/register', register);         // Create new user account
router.post('/login', login);              // Authenticate user and create session

// Protected routes (require valid JWT)
router.post('/logout', authenticateToken, logout);     // End user session
router.get('/user', authenticateToken, getUserInfo);   // Get authenticated user data

module.exports = router;
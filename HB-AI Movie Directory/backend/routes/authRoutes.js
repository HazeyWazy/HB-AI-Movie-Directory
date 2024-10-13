const express = require('express');
const { register, login, logout} = require('../controllers/authController');
const authenticateToken = require('../middleware/authenticateToken'); // Import middleware
const router = express.Router();


router.post('/register', register);
router.post('/login', login);
router.post('/logout', authenticateToken, logout); // Protect logout route
router.get('/user', authenticateToken, getUserInfo);

module.exports = router;

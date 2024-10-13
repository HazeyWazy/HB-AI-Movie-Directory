const express = require('express');
const { register, login, logout, getUserInfo} = require('../controllers/authController');
const authenticateToken = require('../middleware/authenticateToken'); 
const router = express.Router();


router.post('/register', register);
router.post('/login', login);
router.post('/logout', authenticateToken, logout); 
router.get('/user', authenticateToken, getUserInfo);

module.exports = router;

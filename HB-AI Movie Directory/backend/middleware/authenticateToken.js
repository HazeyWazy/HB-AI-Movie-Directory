const jwt = require('jsonwebtoken');
const User = require('../models/User');

const authenticateToken = async (req, res, next) => {
  // Get token from cookie or Authorization header
  const token = req.cookies.token || req.header('Authorization')?.replace('Bearer ', '');

  if (!token) {
    return res.status(401).json({ error: "Unauthorized: No token provided" });
  }

  try {
    // Verify the token using the secret key
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('Decoded Token:', decoded);

    req.user = await User.findById(decoded.userId).populate('watchlists');
    next(); // Pass control to the next middleware
  } catch (error) {
    console.error('JWT Verification Error:', error);

    return res.status(401).json({ error: "Unauthorized: Invalid or expired token" });
  }
};

module.exports = authenticateToken;

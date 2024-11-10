// Middleware to verify JWT tokens and authenticate requests
const jwt = require('jsonwebtoken');

// Validates JWT token from cookies or Authorization header
const authenticateToken = async (req, res, next) => {
  // Get token from cookie or Authorization header with Bearer scheme
  const token = req.cookies.token || req.header('Authorization')?.replace('Bearer ', '');

  if (!token) {
    return res.status(401).json({ error: "Unauthorized: No token provided" });
  }

  console.log('Received token:', token); // Debugging log

  // Verify token and attach user data to request
  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    console.log('JWT verify result:', err, decoded);  // Debugging log
    if (err) {
      console.log('Token verification failed:', err); // Debugging log
      return res.status(403).json({ error: "Failed to authenticate token" });
    }
    
    req.user = decoded;
    console.log('User attached to request:', req.user); // Debugging log
    next();
  });
};

module.exports = authenticateToken;
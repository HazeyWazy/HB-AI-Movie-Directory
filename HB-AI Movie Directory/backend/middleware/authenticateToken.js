const jwt = require('jsonwebtoken');

const authenticateToken = async (req, res, next) => {
  // Get token from cookie or Authorization header
  const token = req.cookies.token || req.header('Authorization')?.replace('Bearer ', '');

  if (!token) {
    return res.status(401).json({ error: "Unauthorized: No token provided" });
  }

  console.log('Received token:', token); // Add this line for debugging

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    console.log('JWT verify result:', err, decoded);  // Modified this line for clarity
    if (err) {
      console.log('Token verification failed:', err); // Add this line for debugging
      return res.status(403).json({ error: "Failed to authenticate token" });
    }
    
    req.user = decoded;
    console.log('User attached to request:', req.user); // Add this line for debugging
    next();
  });
};

module.exports = authenticateToken;

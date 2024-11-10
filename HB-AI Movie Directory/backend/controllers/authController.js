// Handles user authentication operations including registration, login, and session management
const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Creates new user account with validation checks
exports.register = async (req, res) => {
  const { name, email, password } = req.body;
  
  // Validate required fields
  if (!name || !email || !password) {
    return res.status(400).json({ 
      error: "Missing required fields", 
      details: {
        name: !name ? "Name is required" : null,
        email: !email ? "Email is required" : null,
        password: !password ? "Password is required" : null
      }
    });
  }

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ error: "Email already registered" });

    const newUser = new User({ name, email, password });
    await newUser.save();

    return res.status(201).json({ message: "User registered successfully" });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

// Authenticates user and creates JWT session token
exports.login = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    // Generate JWT Token
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
    
    // Store token in an HttpOnly cookie for security
    res.cookie("token", token, { httpOnly: true, secure: process.env.NODE_ENV === 'production' });
    
    return res.status(200).json({ message: "Login successful", token });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

// Ends user session by clearing auth token
exports.logout = (req, res) => {
  res.clearCookie("token");
  return res.status(200).json({ message: "Logout successful" });
};

// Retrieves authenticated user's information
exports.getUserInfo = async (req, res) => {
  console.log('Request user object:', req.user);  // for debugging
  try {
    if (!req.user || !req.user.userId) {
      return res.status(401).json({ error: "Unauthorized: User not authenticated" });
    }
    const user = await User.findById(req.user.userId).select('-password');
    console.log('Found user:', user);  // for debugging
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    res.json(user);
  } catch (error) {
    console.error('Error in getUserInfo:', error);  // for debugging
    res.status(500).json({ error: error.message });
  }
};
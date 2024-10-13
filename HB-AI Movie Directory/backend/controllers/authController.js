const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Watchlist = require('../models/Watchlist');
const bcrypt = require('bcryptjs');

exports.register = async (req, res) => {
    const { name, email, password } = req.body;
    try {
      const existingUser = await User.findOne({ email });
      if (existingUser) return res.status(400).json({ error: "Email already registered" });
  
      const newUser = new User({ name, email, password });
      await newUser.save();

    // Create default watchlist
    const favWatchlist = new Watchlist({ name: "Favourite Watchlist", user: newUser._id });
    await favWatchlist.save();

    return res.status(201).json({ message: "User registered successfully" });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

exports.login = async (req, res) => {
  const { email, password } = req.body;
  try {
    console.log('Login attempt for email:', email);
    const user = await User.findOne({ email });
    if (!user) {
      console.log('User not found');
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const isMatch = await user.comparePassword(password);
    console.log('Password match:', isMatch);

    if (!isMatch) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    // Generate JWT Token
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });

    // Store token in an HttpOnly cookie
    res.cookie("token", token);
    console.log('Generated Token:', token);
    
    console.log('Login successful');
    return res.status(200).json({ message: "Login successful", token });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ error: error.message });
  }
};
  
  exports.logout = (req, res) => {
    // Clear token cookie on logout
    res.clearCookie("token");
    return res.status(200).json({ message: "Logout successful" });
  };

  // Upload profile picture
exports.uploadProfilePicture = async (req, res) => {
    try {
      const user = await User.findById(req.user._id); // req.user is populated by the JWT middleware
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
  
      // Update user with the new profile picture filename
      user.profilePicture = req.file.filename;
      await user.save();
  
      res.status(200).json({ message: 'Profile picture uploaded successfully', filename: req.file.filename });
    } catch (error) {
      res.status(500).json({ error: 'Failed to upload profile picture', details: error.message });
    }
  };
  
  // Serve the profile picture
  exports.getProfilePicture = async (req, res) => {
    const filename = req.params.filename;
  
    gfs.files.findOne({ filename }, (err, file) => {
      if (!file || file.length === 0) {
        return res.status(404).json({ error: 'No file exists' });
      }
  
      // Check if it's an image
      if (file.contentType === 'image/jpeg' || file.contentType === 'image/png') {
        const readStream = gfs.createReadStream(file.filename);
        readStream.pipe(res);
      } else {
        res.status(404).json({ error: 'Not an image' });
      }
    });
  };
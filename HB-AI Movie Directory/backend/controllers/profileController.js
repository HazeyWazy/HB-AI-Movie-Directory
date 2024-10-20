const User = require('../models/User');

exports.getProfile = async (req, res) => {
    try {
      const user = await User.findById(req.user.userId).select('-password');
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      // Construct full URL for profile picture
      if (user.profilePicture) {
        user.profilePicture = `${req.protocol}://${req.get('host')}/${user.profilePicture}`;
      }
      res.json(user);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  };

exports.updateProfile = async (req, res) => {
  try {
    const { name, bio } = req.body;
    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    
    if (name) user.name = name;
    if (bio) user.bio = bio;
    
    await user.save();
    res.json({ message: "Profile updated successfully", user });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.uploadProfilePicture = async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: "No file uploaded" });
      }
      
      const user = await User.findById(req.user.userId);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      
      // Store the relative path
      user.profilePicture = `uploads/${req.file.filename}`;
      await user.save();
      
      // Return the full URL in the response
      const fullUrl = `${req.protocol}://${req.get('host')}/${user.profilePicture}`;
      res.json({ message: "Profile picture uploaded successfully", profilePicture: fullUrl });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  };
// Handles user profile operations including profile updates and picture management
const User = require("../models/User");

// Retrieves user profile information excluding sensitive data
exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select("-password");
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    // Send the profile picture URL as is, without modifying it
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Updates user profile information (name and bio)
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

// Handles profile picture upload and updates user profile
exports.uploadProfilePicture = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Store only the Cloudinary URL
    user.profilePicture = req.file.path;
    await user.save();

    res.json({
      message: "Profile picture uploaded successfully",
      profilePicture: user.profilePicture,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
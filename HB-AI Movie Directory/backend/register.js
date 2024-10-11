var express = require("express");
var router = express.Router();
const User = require("./models/User");

router.post("/", async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return res.status(400).render("register", {
        error: "All fields are required.",
      });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).render("register", {
        error: "Email is already registered.",
      });
    }

    const newUser = new User({
      name,
      email,
      password,
    });

    await newUser.save();

    return res.status(200).json({
      message: "All good",
    });
  } catch (error) {
    console.error("Error: ", error.message);
    return res.status(500).json({
      details: error.message,
    });
  }
});

module.exports = router;

var express = require("express");
var router = express.Router();
const User = require("./models/User");
const Session = require("./models/Session");

async function createSession(userId) {
  const session = new Session({ userId });
  await session.save();
  return session._id.toString();
}

router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ error: "Email or Password are incorrect" });
    }
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ error: "Email or Password are incorrect" });
    }
    const ExistingSessionId = req.cookies["SESSION"];
    if (ExistingSessionId) {
      return res.status(200).json({ message: "User Already logged in" });
    }
    const sessionID = await createSession(user._id);
    // res.cookie("SESSION", sessionID, { httpOnly: true, secure: true });
    res.cookie("SESSION", sessionID, { httpOnly: true, secure: false });

    return res.status(200).json({ message: "Login Success" });
  } catch (error) {
    return res
      .status(500)
      .json({ error: "Server error", details: error.message });
  }
});

router.post("/logout", async (req, res) => {
  const sessionId = req.cookies["SESSION"];
  console.log("Session ID from cookie:", sessionId);
  if (sessionId) {
    await Session.findByIdAndDelete(sessionId);
    res.clearCookie("SESSION");
    return res.status(200).json({ message: "Logout Success" });
  } else {
    return res.status(200).json({ message: "No user logged in" });
  }
});

module.exports = router;

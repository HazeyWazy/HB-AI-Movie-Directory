const User = require("../models/User");
const Session = require("../models/Session");

async function loadUser(req, res, next) {
  const sessionId = req.cookies["SESSION"];
  if (sessionId) {
    const session = await Session.findById(sessionId);
    if (session) {
      const user = await User.findById(session.userId);
      if (user) {
        req.user = user;
        return next();
      }
    }
  }
  next();
}

module.exports = loadUser;

const jwt = require("jsonwebtoken");
const { jwtSecret } = require("../config/env");
const User = require("../models/User"); // ✅ make sure this path is correct

async function authRequired(req, res, next) {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;

  if (!token) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  try {
    // ✅ Verify token
    const payload = jwt.verify(token, jwtSecret);

    // ✅ Fetch latest user data from DB (important for updated subscription)
    const user = await User.findById(payload.sub).select("subscriptionPlan email name");

    if (!user) {
      return res.status(401).json({ error: "User not found" });
    }

    // ✅ Attach updated user info to request
    req.user = {
      id: user._id,
      plan: user.subscriptionPlan || "FREE",
      email: user.email,
      name: user.name,
    };

    next();
  } catch (err) {
    console.error("Auth error:", err);
    return res.status(401).json({ error: "Invalid or expired token" });
  }
}

module.exports = { authRequired };

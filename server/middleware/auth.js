const jwt = require("jsonwebtoken")
const { jwtSecret } = require("../config/env")

// Renamed to 'authenticate' and exported also as 'authRequired' for backwards compatibility
function authenticate(req, res, next) {
  const header = req.headers.authorization || ""
  const token = header.startsWith("Bearer ") ? header.slice(7) : null

  if (!token) {
    return res.status(401).json({ error: "Unauthorized: Missing token" })
  }

  try {
    const payload = jwt.verify(token, jwtSecret)
    // Attach user info for downstream usage (billing/drop limits)
    req.user = { id: payload.sub, plan: payload.plan || "FREE" }
    next()
  } catch (e) {
    console.error("[auth] JWT verification failed:", e.message)
    return res.status(401).json({ error: "Invalid token" })
  }
}

module.exports = {
  authenticate,
  authRequired: authenticate, // alias
}

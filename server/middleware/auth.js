const jwt = require("jsonwebtoken")
const { jwtSecret } = require("../config/env")

function authRequired(req, res, next) {
  const header = req.headers.authorization || ""
  const token = header.startsWith("Bearer ") ? header.slice(7) : null
  if (!token) return res.status(401).json({ error: "Unauthorized" })
  try {
    const payload = jwt.verify(token, jwtSecret)
    req.user = { id: payload.sub, plan: payload.plan || "FREE" }
    next()
  } catch (e) {
    return res.status(401).json({ error: "Invalid token" })
  }
}

module.exports = { authRequired }

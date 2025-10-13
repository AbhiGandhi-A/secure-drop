const jwt = require("jsonwebtoken")
const { jwtSecret } = require("../config/env")
// Assuming you have the User model, though not strictly needed for this file
// const User = require("../models/User") 

// Renamed from authRequired to be more expressive of its function
function authenticate(req, res, next) {
  const header = req.headers.authorization || ""
  const token = header.startsWith("Bearer ") ? header.slice(7) : null
  
  if (!token) {
    return res.status(401).json({ error: "Unauthorized: Missing token" })
  }

  try {
    // Verify the token using the secret key
    const payload = jwt.verify(token, jwtSecret)
    
    // CRITICAL: Attach the user info from the JWT payload to the request
    // The billing controller needs req.user.id to be populated.
    req.user = { id: payload.sub, plan: payload.plan || "FREE" }
    next()
  } catch (e) {
    console.error("JWT verification failed:", e.message)
    return res.status(401).json({ error: "Invalid token" })
  }
}

module.exports = { authenticate }
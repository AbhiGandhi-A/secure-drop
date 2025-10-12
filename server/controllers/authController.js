const bcrypt = require("bcrypt")
const jwt = require("jsonwebtoken")
const { validationResult } = require("express-validator")
const User = require("../models/User")
const { jwtSecret } = require("../config/env")

function signToken(user) {
  return jwt.sign({ sub: user._id.toString(), plan: user.subscriptionPlan }, jwtSecret, { expiresIn: "1h" })
}

async function register(req, res, next) {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() })

    const { name, email, password } = req.body
    const existing = await User.findOne({ email })
    if (existing) return res.status(400).json({ error: "Email already registered" })

    const passwordHash = await bcrypt.hash(password, 12)
    const user = await User.create({ name, email, passwordHash, subscriptionPlan: "FREE" })

    const token = signToken(user)
    res.json({ token, user: { id: user._id, name: user.name, email: user.email, plan: user.subscriptionPlan } })
  } catch (e) {
    next(e)
  }
}

async function login(req, res, next) {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() })

    const { email, password } = req.body
    const user = await User.findOne({ email })
    if (!user) return res.status(401).json({ error: "Invalid credentials" })

    const ok = await bcrypt.compare(password, user.passwordHash)
    if (!ok) return res.status(401).json({ error: "Invalid credentials" })

    const token = signToken(user)
    res.json({ token, user: { id: user._id, name: user.name, email: user.email, plan: user.subscriptionPlan } })
  } catch (e) {
    next(e)
  }
}

module.exports = { register, login }

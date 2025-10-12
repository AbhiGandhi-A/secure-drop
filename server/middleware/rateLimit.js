const rateLimit = require("express-rate-limit")

const createLimiter = (opts) =>
  rateLimit({
    windowMs: opts.windowMs || 15 * 60 * 1000,
    max: opts.max || 100,
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: "Too many requests, please try again later." },
  })

module.exports = {
  limiterGeneral: createLimiter({ windowMs: 10 * 60 * 1000, max: 300 }),
  limiterAuth: createLimiter({ windowMs: 15 * 60 * 1000, max: 30 }),
  limiterDrops: createLimiter({ windowMs: 10 * 60 * 1000, max: 120 }),
  limiterChat: createLimiter({ windowMs: 10 * 60 * 1000, max: 60 }),
}

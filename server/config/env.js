// Centralized environment configuration with defaults and type coercion
require("dotenv").config()

const toInt = (v, d) => {
  const n = Number.parseInt(v, 10)
  return Number.isFinite(n) ? n : d
}

const toBool = (v, d = false) => {
  if (v === undefined) return d
  return String(v).toLowerCase() === "true"
}

module.exports = {
  // Server config
  port: toInt(process.env.PORT, 8080),
  nodeEnv: process.env.NODE_ENV || "development",
  jwtSecret: process.env.JWT_SECRET || "change-me",
  corsOrigin: process.env.CORS_ORIGIN || "*",

  // MongoDB
  mongoUri: process.env.MONGODB_URI || "mongodb://localhost:27017/secure-drop",

  // Storage
  storageDriver: process.env.STORAGE_DRIVER || "local",
  uploadDir: process.env.UPLOAD_DIR || "uploads",

  // File size limits (bytes)
  limits: {
    anonMaxBytes: toInt(process.env.ANON_MAX_FILE_BYTES, 5 * 1024 * 1024),       // 5 MB
    freeMaxBytes: toInt(process.env.FREE_MAX_FILE_BYTES, 25 * 1024 * 1024),      // 25 MB
    premiumMaxBytes: toInt(process.env.PREMIUM_MAX_FILE_BYTES, 250 * 1024 * 1024) // 250 MB
  },

  // Expiry times (hours)
  expiry: {
    anonMaxHours: toInt(process.env.ANON_MAX_EXPIRE_HOURS, 6),
    freeMaxHours: toInt(process.env.FREE_MAX_EXPIRE_HOURS, 24),
    premiumMaxHours: toInt(process.env.PREMIUM_MAX_EXPIRE_HOURS, 7 * 24)
  },

  // Virus scanning
  virusScanEnabled: toBool(process.env.VIRUS_SCAN_ENABLED, false),

  // OpenAI
  openaiApiKey: process.env.OPENAI_API_KEY || "",

  // Razorpay config
  razorpay: {
    keyId: process.env.RAZORPAY_KEY_ID || "",
    keySecret: process.env.RAZORPAY_KEY_SECRET || "",
    priceMonthly: toInt(process.env.RAZORPAY_PRICE_MONTHLY, 50000), // default 500.00 INR
    priceYearly: toInt(process.env.RAZORPAY_PRICE_YEARLY, 500000)   // default 5000.00 INR
  },

  // AWS S3 (optional)
  s3: {
    region: process.env.AWS_REGION || "",
    bucket: process.env.S3_BUCKET_NAME || ""
  }
}

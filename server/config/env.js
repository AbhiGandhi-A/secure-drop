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

// Byte conversion helper
const MB = 1024 * 1024;

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

  // FILE SIZE LIMITS (bytes)
  limits: {
    anonMaxBytes: toInt(process.env.ANON_MAX_FILE_BYTES, 5 * MB),          // 5 MB (Guest/Anon)
    freeMaxBytes: toInt(process.env.FREE_MAX_FILE_BYTES, 100 * MB),         // 100 MB (Logged in, FREE plan)
    premiumMaxBytes: toInt(process.env.PREMIUM_MAX_FILE_BYTES, 200 * MB)   // 200 MB (PREMIUM plans)
  },

  // 🚨 UPDATED EXPIRY TIMES (hours)
  expiry: {
    anonMaxHours: toInt(process.env.ANON_MAX_EXPIRE_HOURS, 6),
    freeMaxHours: toInt(process.env.FREE_MAX_EXPIRE_HOURS, 24),
    // Premium Monthly: 1 week (7 * 24 = 168 hours)
    premiumMonthlyMaxHours: toInt(process.env.PREMIUM_MONTHLY_MAX_EXPIRE_HOURS, 168), 
    // Premium Yearly: 2 weeks (14 * 24 = 336 hours)
    premiumYearlyMaxHours: toInt(process.env.PREMIUM_YEARLY_MAX_EXPIRE_HOURS, 336), 
  },

  // 🚨 NEW MAX DOWNLOADS CONFIGURATION
  maxDownloads: {
    anon: toInt(process.env.ANON_MAX_DOWNLOADS, 3),
    free: toInt(process.env.FREE_MAX_DOWNLOADS, 5),
    monthly: toInt(process.env.PREMIUM_MONTHLY_MAX_DOWNLOADS, 20),
    yearly: toInt(process.env.PREMIUM_YEARLY_MAX_DOWNLOADS, 99999), // Use a large number for "unlimited"
  },

  // Virus scanning
  virusScanEnabled: toBool(process.env.VIRUS_SCAN_ENABLED, false),

  // OpenAI
  openaiApiKey: process.env.OPENAI_API_KEY || "",

  // Razorpay config
  razorpay: {
    keyId: process.env.RAZORPAY_KEY_ID || "",
    keySecret: process.env.RAZORPAY_KEY_SECRET || "",
    priceMonthly: toInt(process.env.RAZORPAY_PRICE_MONTHLY, 50000), 
    priceYearly: toInt(process.env.RAZORPAY_PRICE_YEARLY, 500000)   
  },

  // AWS S3 (optional)
  s3: {
    region: process.env.AWS_REGION || "",
    bucket: process.env.S3_BUCKET_NAME || ""
  }
}
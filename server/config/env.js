// Centralized env with defaults and coercion
require("dotenv").config()

const toInt = (v, d) => (Number.isFinite(Number.parseInt(v, 10)) ? Number.parseInt(v, 10) : d)

module.exports = {
  port: toInt(process.env.PORT, 8080),
  nodeEnv: process.env.NODE_ENV || "development",
  jwtSecret: process.env.JWT_SECRET || "change-me",
  corsOrigin: process.env.CORS_ORIGIN || "*",

  mongoUri: process.env.MONGODB_URI,

  storageDriver: process.env.STORAGE_DRIVER || "local",
  uploadDir: process.env.UPLOAD_DIR || "uploads",

  limits: {
    anonMaxBytes: toInt(process.env.ANON_MAX_FILE_BYTES, 5 * 1024 * 1024),
    freeMaxBytes: toInt(process.env.FREE_MAX_FILE_BYTES, 25 * 1024 * 1024),
    premiumMaxBytes: toInt(process.env.PREMIUM_MAX_FILE_BYTES, 250 * 1024 * 1024),
  },
  expiry: {
    anonMaxHours: toInt(process.env.ANON_MAX_EXPIRE_HOURS, 6),
    freeMaxHours: toInt(process.env.FREE_MAX_EXPIRE_HOURS, 24),
    premiumMaxHours: toInt(process.env.PREMIUM_MAX_EXPIRE_HOURS, 7 * 24),
  },

  virusScanEnabled: String(process.env.VIRUS_SCAN_ENABLED).toLowerCase() === "true",

  openaiApiKey: process.env.OPENAI_API_KEY || "",

  razorpay: {
    keyId: process.env.RAZORPAY_KEY_ID || "",
    keySecret: process.env.RAZORPAY_KEY_SECRET || "",
    priceMonthly: Number(process.env.RAZORPAY_PRICE_MONTHLY || 0),
    priceYearly: Number(process.env.RAZORPAY_PRICE_YEARLY || 0),
  },

  s3: {
    region: process.env.AWS_REGION || "",
    bucket: process.env.S3_BUCKET_NAME || "",
  },
}

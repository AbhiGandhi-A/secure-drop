// Maps client-side request names to database ENUM values
const PLAN_MAP = {
  monthly: "PREMIUM_MONTHLY",
  yearly: "PREMIUM_YEARLY",
  free: "FREE",
  anon: "ANON",
}

// Feature limits in ms and integer counts (for reference/derivations)
const PLAN_LIMITS = {
  FREE: {
    maxExpiry: 24 * 60 * 60 * 1000, // 24 hours
    maxDownloads: 5,
    maxFileSize: 50 * 1024 * 1024, // 50MB (example)
  },
  ANON: {
    maxExpiry: 6 * 60 * 60 * 1000, // 6 hours
    maxDownloads: 3,
    maxFileSize: 10 * 1024 * 1024, // 10MB (example)
  },
  PREMIUM_MONTHLY: {
    maxExpiry: 7 * 24 * 60 * 60 * 1000, // 1 week
    maxDownloads: 20,
    maxFileSize: 250 * 1024 * 1024, // 250MB (example)
  },
  PREMIUM_YEARLY: {
    maxExpiry: 14 * 24 * 60 * 60 * 1000, // 2 weeks
    maxDownloads: Number.POSITIVE_INFINITY, // Unlimited
    maxFileSize: 500 * 1024 * 1024, // 500MB (example)
  },
}

/**
 * Gets the limits for a given plan (e.g., FREE, PREMIUM_MONTHLY).
 * @param {string} plan - The plan string from the database (e.g., 'PREMIUM_MONTHLY').
 */
function getLimits(plan) {
  return PLAN_LIMITS[plan] || PLAN_LIMITS.FREE
}

module.exports = {
  PLAN_MAP,
  PLAN_LIMITS,
  getLimits,
}

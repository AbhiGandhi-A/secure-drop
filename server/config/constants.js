// Plans, sizes, and roles in one place
module.exports = {
  plans: {
    ANON: "ANON",
    FREE: "FREE",
    PREMIUM: "PREMIUM",
  },

  allowedMimeTypes: [
    "text/plain",
    "application/pdf",
    "image/png",
    "image/jpeg",
    "image/gif",
    "application/zip",
    "application/x-zip-compressed",
  ],

  pin: {
    minLen: 6,
    maxLen: 8,
  },
}

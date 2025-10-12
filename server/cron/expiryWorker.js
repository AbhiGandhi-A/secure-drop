const cron = require("node-cron")
const Drop = require("../models/Drop")
const storage = require("../utils/storage")

// Runs every minute: mark expired items deleted and remove files
function startExpiryWorker() {
  cron.schedule("* * * * *", async () => {
    try {
      const now = new Date()
      const expired = await Drop.find({ isDeleted: false, expiresAt: { $lte: now } }).limit(500)
      for (const d of expired) {
        if (d.filePath) await storage.removeFile(d.filePath)
        d.isDeleted = true
        d.filePath = ""
        await d.save()
      }
      if (expired.length) console.log(`[expiry] Cleaned ${expired.length} drops`)
    } catch (e) {
      console.error("[expiry] error", e.message)
    }
  })
}

module.exports = { startExpiryWorker }

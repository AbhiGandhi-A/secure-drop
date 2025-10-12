const { virusScanEnabled } = require("../config/env")

// Optional stub. You can integrate with clamd or a service.
// Return { clean: boolean, reason?: string }
async function scanFile(filePath) {
  if (!virusScanEnabled) return { clean: true }
  // Integrate with clamscan or external service here.
  // For now, always returns clean = true.
  return { clean: true }
}

module.exports = { scanFile }

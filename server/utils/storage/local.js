const path = require("path")
const fs = require("fs")
const { uploadDir } = require("../../config/env")

function ensureDir() {
  const abs = getAbsolute(uploadDir)
  if (!fs.existsSync(abs)) fs.mkdirSync(abs, { recursive: true })
}

function getAbsolute(filePath) {
  return path.isAbsolute(filePath) ? filePath : path.join(process.cwd(), filePath)
}

async function removeFile(filePath) {
  try {
    if (!filePath) return
    const abs = getAbsolute(filePath)
    if (fs.existsSync(abs)) fs.unlinkSync(abs)
  } catch (e) {
    console.error("[storage] remove error", e.message)
  }
}

module.exports = {
  ensureDir,
  removeFile,
}

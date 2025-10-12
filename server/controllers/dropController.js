const path = require("path")
const fs = require("fs")
const jwt = require("jsonwebtoken")
const { validationResult } = require("express-validator")
const mime = require("mime-types")
const Drop = require("../models/Drop")
const { generateHashedPIN, maskPIN } = require("../utils/pin")
const { compareValue } = require("../utils/hash")
const { allowedMimeTypes } = require("../config/constants")
const { limits, expiry, jwtSecret, uploadDir } = require("../config/env")
const storage = require("../utils/storage")
const { scanFile } = require("../services/virusScan")

function planFromReq(req) {
  if (!req.user) return "ANON"
  return req.user.plan || "FREE"
}

function getMaxBytes(plan) {
  if (plan === "PREMIUM") return limits.premiumMaxBytes
  if (plan === "FREE") return limits.freeMaxBytes
  return limits.anonMaxBytes
}

function getMaxExpireHours(plan) {
  if (plan === "PREMIUM") return expiry.premiumMaxHours
  if (plan === "FREE") return expiry.freeMaxHours
  return expiry.anonMaxHours
}

async function createDrop(req, res, next) {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      if (req.file) fs.unlinkSync(req.file.path)
      return res.status(400).json({ errors: errors.array() })
    }

    const plan = planFromReq(req)
    const maxBytes = getMaxBytes(plan)
    const maxExpire = getMaxExpireHours(plan)

    const { message = "", expiresInHours = Math.min(24, maxExpire), maxDownloads = 1, oneTime = false } = req.body

    const oneTimeBool = typeof oneTime === "string" ? oneTime.toLowerCase() === "true" : !!oneTime
    const maxDownloadsNum = Math.min(Number.parseInt(maxDownloads, 10) || 1, 100)

    // File validations
    let filename = ""
    let mimeType = ""
    let filePath = ""
    if (req.file) {
      if (req.file.size > maxBytes) {
        fs.unlinkSync(req.file.path)
        return res.status(400).json({ error: "File too large for your plan" })
      }
      mimeType = mime.lookup(req.file.originalname) || req.file.mimetype || "application/octet-stream"
      if (!allowedMimeTypes.includes(mimeType)) {
        fs.unlinkSync(req.file.path)
        return res.status(400).json({ error: "Unsupported file type" })
      }

      // Virus scan (optional)
      const scan = await scanFile(req.file.path)
      if (!scan.clean) {
        fs.unlinkSync(req.file.path)
        return res.status(400).json({ error: `File rejected: ${scan.reason || "virus detected"}` })
      }

      filename = req.file.originalname
      filePath = req.file.path
    }

    const hours = Math.min(Number.parseInt(expiresInHours, 10) || 24, maxExpire)
    const expiresAt = new Date(Date.now() + hours * 3600 * 1000)
    const { plain, tokenHash } = await generateHashedPIN()

    const drop = await Drop.create({
      tokenHash,
      shortPIN: maskPIN(plain), // stored masked; optional
      uploaderId: req.user?.id || null,
      message,
      filename,
      mimeType,
      filePath,
      maxDownloads: oneTimeBool ? 1 : maxDownloadsNum,
      downloadsCount: 0,
      oneTime: oneTimeBool,
      isDeleted: false,
      expiresAt,
    })

    res.json({
      id: drop._id,
      pin: plain, // Only returned once
      expiresAt,
      maxDownloads: drop.maxDownloads,
      oneTime: drop.oneTime,
    })
  } catch (e) {
    next(e)
  }
}

async function viewDrop(req, res, next) {
  try {
    const { pin } = req.body
    const rawPin = typeof pin === "string" ? pin.trim() : String(pin || "")
    if (!rawPin || rawPin.length < 6 || rawPin.length > 8) {
      return res.status(400).json({ error: "Invalid PIN format" })
    }

    // Previously limited to latest 1000 docs; remove that limit so the same PIN
    // remains valid until its real expiry and download limits.
    const candidates = await Drop.find({}).sort({ createdAt: -1 })

    let matched = null
    for (const d of candidates) {
      if (await compareValue(rawPin, d.tokenHash)) {
        matched = d
        break
      }
    }

    if (!matched) {
      return res.status(404).json({ error: "Invalid PIN" })
    }

    // Explicit checks for user-friendly messages
    if (matched.expiresAt && matched.expiresAt <= new Date()) {
      return res.status(410).json({ error: "Expired" })
    }
    if (matched.isDeleted) {
      return res.status(410).json({ error: "Deleted or limit reached" })
    }
    if (Number(matched.downloadsCount || 0) >= Number(matched.maxDownloads || 1)) {
      return res.status(410).json({ error: "Download limit reached" })
    }

    // Issue a short-lived download token if a file exists
    let downloadToken = null
    if (matched.filePath && matched.filename && !matched.isDeleted) {
      downloadToken = jwt.sign({ dropId: matched._id.toString() }, jwtSecret, { expiresIn: "5m" })
    }

    res.json({
      id: matched._id,
      message: matched.message || "",
      file: matched.filePath
        ? {
            filename: matched.filename,
            mimeType: matched.mimeType,
            sizeBytes: (() => {
              try {
                return fs.statSync(matched.filePath).size
              } catch {
                return null
              }
            })(),
          }
        : null,
      expiresAt: matched.expiresAt,
      remainingDownloads: Math.max(Number(matched.maxDownloads || 1) - Number(matched.downloadsCount || 0), 0),
      downloadToken,
    })
  } catch (e) {
    next(e)
  }
}

async function downloadDrop(req, res, next) {
  try {
    const { token } = req.query
    if (!token) return res.status(400).json({ error: "Missing token" })

    let payload
    try {
      payload = jwt.verify(token, jwtSecret)
    } catch {
      return res.status(401).json({ error: "Invalid or expired token" })
    }

    const drop = await Drop.findById(payload.dropId)
    if (!drop || drop.isDeleted) return res.status(404).json({ error: "Not found" })
    if (drop.expiresAt && drop.expiresAt <= new Date()) return res.status(410).json({ error: "Expired" })
    if (!drop.filePath) return res.status(400).json({ error: "No file for this drop" })

    if (Number(drop.downloadsCount || 0) >= Number(drop.maxDownloads || 1)) {
      return res.status(410).json({ error: "Download limit reached" })
    }

    const absPath = path.isAbsolute(drop.filePath) ? drop.filePath : path.resolve(process.cwd(), drop.filePath)
    if (!fs.existsSync(absPath)) return res.status(404).json({ error: "File missing" })

    res.setHeader("Content-Type", drop.mimeType || "application/octet-stream")
    res.setHeader("Content-Disposition", `attachment; filename="${encodeURIComponent(drop.filename)}"`)

    let finalized = false
    const finalize = async () => {
      if (finalized) return
      finalized = true
      try {
        if (res.statusCode !== 200) return // count only successful streams

        const current = Number(drop.downloadsCount || 0)
        const max = Number(drop.maxDownloads || 1)
        const nextCount = current + 1

        drop.downloadsCount = nextCount

        if (nextCount >= max) {
          try {
            await storage.removeFile(drop.filePath)
          } catch (e) {
            console.log("[v0] removeFile error:", e?.message)
          }
          drop.isDeleted = true
          drop.filePath = ""
        }

        await drop.save()
      } catch (e) {
        console.log("[v0] post-download save error:", e?.message)
      }
    }

    res.on("finish", finalize)
    res.on("close", finalize)

    const stream = fs.createReadStream(absPath)
    stream.on("error", (err) => {
      console.log("[v0] download stream error:", err?.message)
      if (!res.headersSent) {
        res.status(404).json({ error: "File missing" })
      } else {
        try {
          res.end()
        } catch {}
      }
    })
    stream.pipe(res)
  } catch (e) {
    next(e)
  }
}

async function deleteDrop(req, res, next) {
  try {
    const { id } = req.params
    const drop = await Drop.findById(id)
    if (!drop) return res.status(404).json({ error: "Not found" })

    // Only owner can delete
    if (!req.user || drop.uploaderId?.toString() !== req.user.id) {
      return res.status(403).json({ error: "Forbidden" })
    }

    if (drop.filePath) await storage.removeFile(drop.filePath)
    drop.isDeleted = true
    drop.filePath = ""
    await drop.save()
    res.json({ ok: true })
  } catch (e) {
    next(e)
  }
}

async function userHistory(req, res, next) {
  try {
    const items = await Drop.find({ uploaderId: req.user.id }).sort({ createdAt: -1 }).limit(200)
    res.json(
      items.map((d) => ({
        id: d._id,
        messagePreview: (d.message || "").slice(0, 120),
        filename: d.filename,
        mimeType: d.mimeType,
        createdAt: d.createdAt,
        expiresAt: d.expiresAt,
        isDeleted: d.isDeleted,
        downloadsCount: d.downloadsCount,
        maxDownloads: d.maxDownloads,
      })),
    )
  } catch (e) {
    next(e)
  }
}

module.exports = {
  createDrop,
  viewDrop,
  downloadDrop,
  deleteDrop,
  userHistory,
}

const fs = require("fs")
const path = require("path")
const mime = require("mime-types")
const { validationResult } = require("express-validator")
const { allowedMimeTypes } = require("../config/constants")
const { limits, uploadDir } = require("../config/env")
const SavedFile = require("../models/SavedFile")
const Folder = require("../models/Folder")
const Drop = require("../models/Drop")
const { scanFile } = require("../services/virusScan")
const storage = require("../utils/storage")
const { generateHashedPIN } = require("../utils/pin")

function getMaxBytes(plan) {
  if (plan === "PREMIUM") return limits.premiumMaxBytes
  if (plan === "FREE") return limits.freeMaxBytes
  return limits.anonMaxBytes
}

async function uploadSavedFile(req, res, next) {
  try {
    if (!req.user) return res.status(401).json({ error: "Auth required" })
    if (!req.file) return res.status(400).json({ error: "No file" })

    const maxBytes = getMaxBytes(req.user.plan || "FREE")
    if (req.file.size > maxBytes) {
      fs.unlinkSync(req.file.path)
      return res.status(400).json({ error: "File too large for your plan" })
    }
    const mimeType = mime.lookup(req.file.originalname) || req.file.mimetype || "application/octet-stream"
    if (!allowedMimeTypes.includes(mimeType)) {
      fs.unlinkSync(req.file.path)
      return res.status(400).json({ error: "Unsupported file type" })
    }

    const scan = await scanFile(req.file.path)
    if (!scan.clean) {
      fs.unlinkSync(req.file.path)
      return res.status(400).json({ error: `File rejected: ${scan.reason || "virus detected"}` })
    }

    // Move file into user-specific folder for saved files
    const userDir = path.resolve(process.cwd(), uploadDir, "saved", req.user.id)
    fs.mkdirSync(userDir, { recursive: true })
    const dest = path.join(userDir, path.basename(req.file.path))
    fs.renameSync(req.file.path, dest)

    // Ensure folderId from either form-data or query (for flexibility)
    const folderId = req.body.folderId || req.query.folderId || null

    const doc = await SavedFile.create({
      userId: req.user.id,
      folderId, // Associate file to folder when provided
      filename: req.file.originalname,
      mimeType,
      sizeBytes: fs.statSync(dest).size,
      filePath: dest,
    })

    res.json({
      id: doc._id,
      filename: doc.filename,
      sizeBytes: doc.sizeBytes,
      mimeType: doc.mimeType,
      folderId: doc.folderId,
      createdAt: doc.createdAt,
    })
  } catch (e) {
    next(e)
  }
}

async function createFolder(req, res, next) {
  try {
    if (!req.user) return res.status(401).json({ error: "Auth required" })
    const name = String(req.body.name || "").trim()
    const parentId = req.body.parentId || null
    if (!name) return res.status(400).json({ error: "Name required" })
    const folder = await Folder.create({ userId: req.user.id, name, parentId })
    res.json({ id: folder._id, name: folder.name, parentId: folder.parentId })
  } catch (e) {
    next(e)
  }
}

async function listSaved(req, res, next) {
  try {
    if (!req.user) return res.status(401).json({ error: "Auth required" })
    const [folders, files] = await Promise.all([
      Folder.find({ userId: req.user.id }).sort({ createdAt: 1 }),
      SavedFile.find({ userId: req.user.id }).sort({ createdAt: -1 }),
    ])
    res.json({
      folders: folders.map((f) => ({ id: f._id, name: f.name, parentId: f.parentId })),
      files: files.map((f) => ({
        id: f._id,
        filename: f.filename,
        mimeType: f.mimeType,
        sizeBytes: f.sizeBytes,
        folderId: f.folderId,
        createdAt: f.createdAt,
      })),
    })
  } catch (e) {
    next(e)
  }
}

async function shareFromSaved(req, res, next) {
  try {
    if (!req.user) return res.status(401).json({ error: "Auth required" })
    const idFromParams = req.params?.id
    const idFromBody = req.body?.fileId
    const fileId = idFromParams || idFromBody

    const { expiresInHours = 24, maxDownloads = 1, oneTime = false, message = "" } = req.body
    if (!fileId) return res.status(400).json({ error: "Missing file id" })

    const file = await SavedFile.findOne({ _id: fileId, userId: req.user.id })
    if (!file) return res.status(404).json({ error: "File not found" })

    const plan = req.user.plan || "FREE"
    const capHours = plan === "PREMIUM" ? (limits?.premiumMaxExpireHours ?? 168) : (limits?.freeMaxExpireHours ?? 24)

    const requestedHours = Math.max(1, Number.parseInt(expiresInHours, 10) || 24)
    const hours = Math.min(capHours, requestedHours)
    const expiresAt = new Date(Date.now() + hours * 3600 * 1000)

    const oneTimeBool = typeof oneTime === "string" ? oneTime.toLowerCase() === "true" : !!oneTime
    const maxDownloadsNum = Math.min(Number.parseInt(maxDownloads, 10) || 1, 100)

    const { plain, tokenHash } = await generateHashedPIN()

    const drop = await Drop.create({
      tokenHash,
      shortPIN: "******", // masked
      uploaderId: req.user.id,
      message,
      filename: file.filename,
      mimeType: file.mimeType,
      filePath: file.filePath,
      maxDownloads: oneTimeBool ? 1 : maxDownloadsNum,
      downloadsCount: 0,
      oneTime: oneTimeBool,
      isDeleted: false,
      expiresAt,
    })

    res.json({
      id: drop._id,
      pin: plain,
      expiresAt,
      maxDownloads: drop.maxDownloads,
      oneTime: drop.oneTime,
    })
  } catch (e) {
    next(e)
  }
}

module.exports = { uploadSavedFile, createFolder, listSaved, shareFromSaved }

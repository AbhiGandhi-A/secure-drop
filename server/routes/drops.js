const router = require("express").Router()
const multer = require("multer")
const path = require("path")
const { authRequired } = require("../middleware/auth")
const { createDropRules, pinRule } = require("../middleware/validators")
// FIX: Change destructuring to import the full object to resolve circular dependency
const dropController = require("../controllers/dropController")
const { limiterDrops } = require("../middleware/rateLimit")
const { uploadDir } = require("../config/env")
const storage = require("../utils/storage")

storage.ensureDir()

const upload = multer({
  dest: path.join(process.cwd(), uploadDir),
  limits: { fileSize: 1024 * 1024 * 1024 }, // actual validation per-plan in controller
})

// Use the imported object's properties
router.post("/create", limiterDrops, upload.single("file"), createDropRules, dropController.createDrop)
router.post("/view", limiterDrops, [pinRule], dropController.viewDrop)
router.get("/download", limiterDrops, dropController.downloadDrop)
// Line 25: Now correctly references dropController.deleteDrop
router.delete("/:id", limiterDrops, authRequired, dropController.deleteDrop)

module.exports = router
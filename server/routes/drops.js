const router = require("express").Router()
const multer = require("multer")
const path = require("path")

const { authenticate } = require("../middleware/auth")
const { createDropRules, pinRule } = require("../middleware/validators")

// Import controller object to avoid circular deps
const dropController = require("../controllers/dropController")
const { limiterDrops } = require("../middleware/rateLimit")
const { uploadDir } = require("../config/env")
const storage = require("../utils/storage")

storage.ensureDir()

const upload = multer({
  dest: path.join(process.cwd(), uploadDir),
  limits: { fileSize: 1024 * 1024 * 1024 }, // actual per-plan validation inside controller
})

router.post("/create", limiterDrops, upload.single("file"), createDropRules, dropController.createDrop)
router.post("/view", limiterDrops, [pinRule], dropController.viewDrop)
router.get("/download", limiterDrops, dropController.downloadDrop)

// Only authenticated user (owner) can delete
router.delete("/:id", limiterDrops, authenticate, dropController.deleteDrop)

module.exports = router

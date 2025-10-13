const router = require("express").Router()
const multer = require("multer")
const path = require("path")
const { authRequired } = require("../middleware/auth")
const { createDropRules, pinRule } = require("../middleware/validators")
// 💡 FIX: Import the whole controller module to resolve potential circular dependency issues
const dropController = require("../controllers/dropController")
const { limiterDrops } = require("../middleware/rateLimit")
const { uploadDir } = require("../config/env")
const storage = require("../utils/storage")

storage.ensureDir()

const upload = multer({
  dest: path.join(process.cwd(), uploadDir),
  limits: { fileSize: 1024 * 1024 * 1024 }, // actual validation per-plan in controller
})

// Access controller functions using the imported object: dropController.functionName
router.post("/create", limiterDrops, upload.single("file"), createDropRules, dropController.createDrop)
router.post("/view", limiterDrops, [pinRule], dropController.viewDrop)
router.get("/download", limiterDrops, dropController.downloadDrop)

// Line 21 (now fixed): deleteDrop is accessed as a property, preventing the 'undefined' error
router.delete("/:id", limiterDrops, authRequired, dropController.deleteDrop)

module.exports = router

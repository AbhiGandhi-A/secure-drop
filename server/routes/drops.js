const router = require("express").Router()
const multer = require("multer")
const path = require("path")
const { authRequired } = require("../middleware/auth")
const { createDropRules, pinRule } = require("../middleware/validators")
// 💡 FIX: Import the whole controller module object to resolve the circular dependency issue.
// Destructuring here causes functions like deleteDrop to load as undefined.
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
// Using the imported object property ensures the function loads correctly, resolving the Error: [object Undefined]
router.delete("/:id", limiterDrops, authRequired, dropController.deleteDrop)

module.exports = router

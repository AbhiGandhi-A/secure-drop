const router = require("express").Router()
const multer = require("multer")
const path = require("path")
const { authRequired } = require("../middleware/auth")
const { createDropRules, pinRule } = require("../middleware/validators")
const { createDrop, viewDrop, downloadDrop, deleteDrop } = require("../controllers/dropController")
const { limiterDrops } = require("../middleware/rateLimit")
const { uploadDir } = require("../config/env")
const storage = require("../utils/storage")

storage.ensureDir()

const upload = multer({
  dest: path.join(process.cwd(), uploadDir),
  limits: { fileSize: 1024 * 1024 * 1024 }, // actual validation per-plan in controller
})

router.post("/create", limiterDrops, upload.single("file"), createDropRules, createDrop)
router.post("/view", limiterDrops, [pinRule], viewDrop)
router.get("/download", limiterDrops, downloadDrop)
router.delete("/:id", limiterDrops, authRequired, deleteDrop)

module.exports = router

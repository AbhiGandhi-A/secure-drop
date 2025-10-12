const router = require("express").Router()
const multer = require("multer")
const path = require("path")
const { authRequired } = require("../middleware/auth")
const { limiterGeneral } = require("../middleware/rateLimit")
const { uploadDir } = require("../config/env")
const { uploadSavedFile, createFolder, listSaved, shareFromSaved } = require("../controllers/filesController")

const upload = multer({
  dest: path.resolve(process.cwd(), uploadDir),
  limits: { fileSize: 1024 * 1024 * 1024 }, // guard; actual plan limits enforced in controller
})

router.get("/list", limiterGeneral, authRequired, listSaved)
router.post("/folder", limiterGeneral, authRequired, createFolder)
router.post("/upload", limiterGeneral, authRequired, upload.single("file"), uploadSavedFile)
router.post("/:id/share", limiterGeneral, authRequired, shareFromSaved)

module.exports = router

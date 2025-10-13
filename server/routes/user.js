const router = require("express").Router()
const { authenticate } = require("../middleware/auth")
const { userHistory } = require("../controllers/dropController")
const { limiterGeneral } = require("../middleware/rateLimit")

router.get("/history", limiterGeneral, authenticate, userHistory)

module.exports = router

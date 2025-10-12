const router = require("express").Router()
const { authRequired } = require("../middleware/auth")
const { userHistory } = require("../controllers/dropController")
const { limiterGeneral } = require("../middleware/rateLimit")

router.get("/history", limiterGeneral, authRequired, userHistory)

module.exports = router

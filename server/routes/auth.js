const router = require("express").Router()
const { emailRule, passwordRule, nameRule } = require("../middleware/validators")
const { register, login } = require("../controllers/authController")
const { limiterAuth } = require("../middleware/rateLimit")

router.post("/register", limiterAuth, [nameRule, emailRule, passwordRule], register)
router.post("/login", limiterAuth, [emailRule, passwordRule], login)

module.exports = router

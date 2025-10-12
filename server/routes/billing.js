const router = require("express").Router()
const { authRequired } = require("../middleware/auth")
const { createOrder, confirmPayment } = require("../controllers/billingController")
const { limiterGeneral } = require("../middleware/rateLimit")

router.post("/create-order", limiterGeneral, authRequired, createOrder)
router.post("/confirm", limiterGeneral, authRequired, confirmPayment)

module.exports = router

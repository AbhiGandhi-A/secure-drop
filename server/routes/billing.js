const router = require("express").Router()
const { createOrder, confirmPayment } = require("../controllers/billingController")
const { limiterGeneral } = require("../middleware/rateLimit")
const { authenticate } = require("../middleware/auth")

// Protect billing routes
router.post("/create-order", limiterGeneral, authenticate, createOrder)
router.post("/confirm", limiterGeneral, authenticate, confirmPayment)

module.exports = router

const router = require("express").Router()
const { createOrder, confirmPayment } = require("../controllers/billingController")
const { limiterGeneral } = require("../middleware/rateLimit")

// Optional auth: you can remove authRequired for anonymous users
router.post("/create-order", limiterGeneral, createOrder)

// 🚨 CORRECTED LINE: Removed createOrder. /confirm should only run confirmPayment.
router.post("/confirm", limiterGeneral, confirmPayment)

module.exports = router
// billingRoutes.js
const router = require("express").Router()
const { createOrder, confirmPayment } = require("../controllers/billingController")
const { limiterGeneral } = require("../middleware/rateLimit")

// Route for creating the order (runs before Razorpay modal opens)
router.post("/create-order", limiterGeneral, createOrder)

// 🚨 CORRECTED: Route for confirming payment (runs after successful payment in modal)
router.post("/confirm", limiterGeneral, confirmPayment)

module.exports = router
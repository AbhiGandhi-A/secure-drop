const router = require("express").Router()
const { createOrder, confirmPayment } = require("../controllers/billingController")
const { limiterGeneral } = require("../middleware/rateLimit")
// 🚨 Ensure you import your authentication middleware here
const { authenticate } = require("../middleware/auth") 

// Route for creating the order MUST be protected
router.post("/create-order", limiterGeneral, authenticate, createOrder) // <-- FIX: 'authenticate' must be here

// Route for confirming payment MUST be protected
router.post("/confirm", limiterGeneral, authenticate, confirmPayment) // <-- FIX: 'authenticate' must be here

module.exports = router
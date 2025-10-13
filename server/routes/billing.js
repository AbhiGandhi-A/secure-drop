const router = require("express").Router()
const { createOrder, confirmPayment } = require("../controllers/billingController")
const { limiterGeneral } = require("../middleware/rateLimit")
const { authenticate } = require("../middleware/auth") // Use the renamed middleware

// The create-order and confirm routes MUST be protected by the 'authenticate' middleware
router.post("/create-order", limiterGeneral, authenticate, createOrder) 
router.post("/confirm", limiterGeneral, authenticate, confirmPayment)

module.exports = router
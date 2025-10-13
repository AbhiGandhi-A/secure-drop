const router = require("express").Router()
// 🚨 CRITICAL: Check this line, it corresponds to line 8 in your logs!
const { createOrder, confirmPayment } = require("../controllers/billingController") 
const { limiterGeneral } = require("../middleware/rateLimit")
const { authenticate } = require("../middleware/auth") 

// Route for creating the order
router.post("/create-order", limiterGeneral, authenticate, createOrder) // <--- One of these is UNDEFINED

// Route for confirming payment
router.post("/confirm", limiterGeneral, authenticate, confirmPayment) // <--- One of these is UNDEFINED

module.exports = router
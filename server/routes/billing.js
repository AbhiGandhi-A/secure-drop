const router = require("express").Router()
const { createOrder, confirmPayment } = require("../controllers/billingController")
const { limiterGeneral } = require("../middleware/rateLimit")

// Optional auth: you can remove authRequired for anonymous users
router.post("/create-order", limiterGeneral, createOrder)
router.post("/confirm", limiterGeneral, createOrder, confirmPayment)

module.exports = router

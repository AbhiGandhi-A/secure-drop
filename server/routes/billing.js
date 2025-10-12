const router = require("express").Router();
const { createOrder, confirmPayment } = require("../controllers/billingController");
const { limiterGeneral } = require("../middleware/rateLimit");
const { authRequired } = require("../middleware/auth"); // ✅ import auth middleware

// 🔹 Create Razorpay Order (must be logged in)
router.post("/create-order", limiterGeneral, authRequired, createOrder);

// 🔹 Confirm Razorpay Payment (must be logged in)
router.post("/confirm", limiterGeneral, authRequired, confirmPayment);

module.exports = router;

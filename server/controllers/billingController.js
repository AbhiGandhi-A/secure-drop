const { razorpay: razorEnv } = require("../config/env")
const crypto = require("crypto")
const User = require("../models/User")

let razorpay = null
try {
  if (razorEnv.keyId && razorEnv.keySecret) {
    const Razorpay = require("razorpay")
    razorpay = new Razorpay({ key_id: razorEnv.keyId, key_secret: razorEnv.keySecret })
  }
} catch (e) {
  console.warn("[billing] Razorpay init failed:", e.message)
}

// Create order
async function createOrder(req, res) {
  try {
    if (!razorpay) return res.status(501).json({ error: "Billing not configured" })

    const { plan = "monthly" } = req.body
    const amount = plan === "yearly" ? razorEnv.priceYearly : razorEnv.priceMonthly
    if (!amount) return res.status(400).json({ error: "Price not configured" })

    const order = await razorpay.orders.create({
      amount, // in paise
      currency: "INR",
      receipt: `sub_${req.user?.id || "anon"}_${Date.now()}`,
      notes: { plan },
    })

    return res.json({
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      keyId: razorEnv.keyId,
      plan,
    })
  } catch (e) {
    console.error("[billing] createOrder error:", e)
    return res.status(500).json({ error: "Failed to create order" })
  }
}

// Confirm payment
async function confirmPayment(req, res) {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, plan = "monthly" } = req.body
    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({ error: "Missing payment fields" })
    }

    const expected = crypto
      .createHmac("sha256", razorEnv.keySecret)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex")

    if (expected !== razorpay_signature) {
      return res.status(400).json({ error: "Signature verification failed" })
    }

    if (req.user?.id) {
      const updatedUser = await User.findByIdAndUpdate(
        req.user.id,
        { subscriptionPlan: plan === "yearly" ? "premium_yearly" : "premium" },
        { new: true, select: "name email subscriptionPlan" } // return only required fields
      )
      return res.json({ ok: true, user: updatedUser })
    }

    return res.status(400).json({ error: "User not found" })
  } catch (e) {
    console.error("[billing] confirmPayment error:", e)
    return res.status(500).json({ error: "Payment verification failed" })
  }
}

module.exports = { createOrder, confirmPayment }

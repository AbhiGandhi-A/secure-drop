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

// Create an order the client will use to open Razorpay Checkout
async function createOrder(req, res, next) {
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
    next(e)
  }
}

// Verify payment signature from client and upgrade user
async function confirmPayment(req, res, next) {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, plan = "monthly" } = req.body || {}
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

    // Mark user as premium; you can also persist plan and renewal date
    if (req.user?.id) {
      await User.findByIdAndUpdate(req.user.id, { subscriptionPlan: "premium" })
    }

    return res.json({ ok: true, plan })
  } catch (e) {
    next(e)
  }
}

module.exports = { createOrder, confirmPayment }

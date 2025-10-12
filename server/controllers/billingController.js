// billingController.js

const { razorpay: razorEnv } = require("../config/env")
const crypto = require("crypto")
const User = require("../models/User") // Ensure this path is correct

let razorpay = null
try {
  // Check if Razorpay keys are configured before attempting to load the library
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
    // Assuming razorEnv.priceYearly and razorEnv.priceMonthly are in paise
    const amount = plan === "yearly" ? razorEnv.priceYearly : razorEnv.priceMonthly
    if (!amount) return res.status(400).json({ error: "Price not configured for this plan" })

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

    // --- Signature Verification ---
    const expected = crypto
      .createHmac("sha256", razorEnv.keySecret)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex")

    if (expected !== razorpay_signature) {
      return res.status(400).json({ error: "Signature verification failed" })
    }

    // --- Successful Payment & User Update ---
    if (req.user?.id) {
      // FIX: Use the correct, case-sensitive enum values from the UserSchema
      // Schema enums are: "FREE", "PREMIUM_MONTHLY", "PREMIUM_YEARLY"
      const newSubscriptionPlan = 
        plan === "yearly" ? "PREMIUM_YEARLY" : "PREMIUM_MONTHLY"
      
      const updatedUser = await User.findByIdAndUpdate(
        req.user.id,
        { subscriptionPlan: newSubscriptionPlan }, // Corrected plan name
        { new: true, select: "name email subscriptionPlan" } // return only required fields
      )

      if (!updatedUser) {
         // This handles a successful payment but a user ID that doesn't exist
         return res.status(404).json({ error: "User not found to update plan" })
      }
      
      // The updated user object returned here has the correct subscriptionPlan
      return res.json({ ok: true, user: updatedUser })
    }

    // Fallback if req.user.id is missing despite successful auth middleware
    return res.status(400).json({ error: "Authenticated user ID missing" })

  } catch (e) {
    console.error("[billing] confirmPayment error:", e)
    return res.status(500).json({ error: "Payment verification failed" })
  }
}

module.exports = { createOrder, confirmPayment }
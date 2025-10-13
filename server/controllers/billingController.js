const { razorpay: razorEnv } = require("../config/env")
const crypto = require("crypto")
const User = require("../models/User")
const { PLAN_MAP } = require("../config/plans") // Import the plan map

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
    // This check is now redundant if the 'authenticate' middleware is applied, 
    // but serves as a safety check.
    if (!req.user?.id) {
        return res.status(401).json({ error: "Authentication required" })
    }
    
    try {
      if (!razorpay) return res.status(501).json({ error: "Billing not configured" })

      const { plan = "monthly" } = req.body // plan is 'monthly' or 'yearly'
      const amount = plan === "yearly" ? razorEnv.priceYearly : razorEnv.priceMonthly
      if (!amount || amount <= 0) return res.status(400).json({ error: "Price not configured" })

      const order = await razorpay.orders.create({
        amount, // in paise
        currency: "INR",
        receipt: `sub_${req.user.id}_${Date.now()}`,
        notes: { plan, userId: req.user.id },
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
    if (!req.user?.id) {
        return res.status(401).json({ error: "Authentication required" }) 
    }
    
    try {
      const { razorpay_order_id, razorpay_payment_id, razorpay_signature, plan = "monthly" } = req.body
      
      // ... (Signature verification logic remains here) ...
      
      // Concatenate the order ID and payment ID
      const expected = crypto
        .createHmac("sha256", razorEnv.keySecret)
        .update(`${razorpay_order_id}|${razorpay_payment_id}`)
        .digest("hex")

      if (expected !== razorpay_signature) {
        console.error("[billing] Signature Mismatch.");
        return res.status(400).json({ error: "Signature verification failed" })
      }
    
      console.log("[billing] Signature verified successfully. Updating user plan.");

      // CRITICAL: Map the client-side 'monthly'/'yearly' to the database ENUM
      const newPlan = PLAN_MAP[plan] || "FREE" 

      const updatedUser = await User.findByIdAndUpdate(
        req.user.id,
        { subscriptionPlan: newPlan }, 
        { 
          new: true, 
          // Ensure we select the plan field to send back to the client
          select: "name email subscriptionPlan _id" 
        } 
      ).lean() // Use .lean() for a plain JS object

      if (!updatedUser) {
          return res.status(404).json({ error: "User profile not found in database." });
      }

      // Format the user object for the client
      const responseUser = {
        id: updatedUser._id.toString(),
        name: updatedUser.name,
        email: updatedUser.email,
        plan: updatedUser.subscriptionPlan, // Client expects 'plan' field
      }

      return res.json({ ok: true, user: responseUser })
    
    } catch (e) {
      console.error("[billing] confirmPayment error:", e)
      return res.status(500).json({ error: "Payment verification failed" })
    }
}

module.exports = { createOrder, confirmPayment }
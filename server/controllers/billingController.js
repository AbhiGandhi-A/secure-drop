const { razorpay: razorEnv } = require("../config/env")
const crypto = require("crypto")
const User = require("../models/User")

let razorpay = null

// 🚨 LOGGING AT SERVER STARTUP 🚨
if (!razorEnv.keyId || !razorEnv.keySecret) {
    console.error("[billing] FATAL: Razorpay environment variables (keyId/keySecret) are MISSING. Check ../config/env.")
} else {
    console.log(`[billing] Razorpay Key ID loaded (ID starts with: ${razorEnv.keyId.substring(0, 4)}...).`)
}

try {
  if (razorEnv.keyId && razorEnv.keySecret) {
    const Razorpay = require("razorpay")
    razorpay = new Razorpay({ key_id: razorEnv.keyId, key_secret: razorEnv.keySecret })
    console.log("[billing] Razorpay instance initialized successfully.")
  }
} catch (e) {
  console.warn("[billing] Razorpay init failed during construction:", e.message)
}


// Create order
async function createOrder(req, res) {
    if (!req.user?.id) {
        return res.status(401).json({ error: "Authentication required" })
    }
    
    try {
      if (!razorpay) {
            console.error("[billing] createOrder failed: Razorpay instance is NULL (Keys likely missing or Razorpay library failed to load).")
            // 🚨 This sends the 'Billing not configured' message
            return res.status(501).json({ error: "Billing not configured" })
        }

      const { plan = "monthly" } = req.body
      const amount = plan === "yearly" ? razorEnv.priceYearly : razorEnv.priceMonthly

      if (!amount || amount <= 0) {
            console.error(`[billing] createOrder failed: Price is invalid. plan=${plan}, amount=${amount}. Check razorEnv.priceMonthly/priceYearly.`)
            // 🚨 This would send a 'Price not configured' message
            return res.status(400).json({ error: "Price not configured" })
        }

      // Log the amount being used for the order
      console.log(`[billing] Creating order for user ${req.user.id} (Plan: ${plan}, Amount: ${amount})`)


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
      console.error("[billing] createOrder error (Razorpay API call failed):", e.message, e)
      // 🚨 This sends the 'Failed to create order' message
      return res.status(500).json({ error: "Failed to create order" })
    }
}

// Confirm payment (remains unchanged)
async function confirmPayment(req, res) {
    // 🚨 Ensure the user is authenticated early
    if (!req.user?.id) {
        return res.status(401).json({ error: "Authentication required" }) 
    }
    
    try {
      const { razorpay_order_id, razorpay_payment_id, razorpay_signature, plan = "monthly" } = req.body
      if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
        return res.status(400).json({ error: "Missing payment fields" })
      }
    
      console.log("--- Razorpay Signature Check Debug Info ---");
      console.log(`1. Secret Key used by server: ${razorEnv.keySecret ? 'Loaded' : 'NOT FOUND'}`);
      console.log(`2. Signature input string: ${razorpay_order_id}|${razorpay_payment_id}`);
      console.log(`3. Signature received from client: ${razorpay_signature}`);
      console.log("-------------------------------------------");


      // Concatenate the order ID and payment ID
      const expected = crypto
        .createHmac("sha256", razorEnv.keySecret)
        .update(`${razorpay_order_id}|${razorpay_payment_id}`)
        .digest("hex")

      if (expected !== razorpay_signature) {
        console.error("[billing] Signature Mismatch: Expected", expected, "Got", razorpay_signature);
        return res.status(400).json({ error: "Signature verification failed" })
      }
    
      console.log("[billing] Signature verified successfully. Updating user plan.");


      // Update the user's subscription plan
      const newPlan = plan === "yearly" ? "PREMIUM_YEARLY" : "PREMIUM_MONTHLY" 

      const updatedUser = await User.findByIdAndUpdate(
        req.user.id,
        { subscriptionPlan: newPlan }, 
        { 
          new: true, 
          select: "name email subscriptionPlan _id" 
        } 
      )
      
      if (!updatedUser) {
          console.error(`[billing] User ID ${req.user.id} not found for update.`);
          return res.status(404).json({ error: "User profile not found in database." });
      }

      const responseUser = {
        id: updatedUser._id.toString(),
        name: updatedUser.name,
        email: updatedUser.email,
        plan: updatedUser.subscriptionPlan, 
      }
      return res.json({ ok: true, user: responseUser })
    
    } catch (e) {
      console.error("[billing] confirmPayment error (Internal Server Error):", e)
      return res.status(500).json({ error: "Payment verification failed" })
    }
}

module.exports = { createOrder, confirmPayment }

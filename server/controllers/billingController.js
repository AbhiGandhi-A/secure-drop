const { razorpay: razorEnv } = require("../config/env");
const crypto = require("crypto");
const User = require("../models/User");

let razorpay = null;
try {
  if (razorEnv.keyId && razorEnv.keySecret) {
    const Razorpay = require("razorpay");
    razorpay = new Razorpay({
      key_id: razorEnv.keyId,
      key_secret: razorEnv.keySecret,
    });
  }
} catch (e) {
  console.warn("[billing] Razorpay init failed:", e.message);
}

// ✅ Create Order
async function createOrder(req, res) {
  try {
    if (!razorpay) return res.status(501).json({ error: "Billing not configured" });

    const { plan = "monthly" } = req.body;
    const amount =
      plan === "yearly" ? razorEnv.priceYearly : razorEnv.priceMonthly;

    if (!amount) return res.status(400).json({ error: "Price not configured" });

    const order = await razorpay.orders.create({
      amount, // in paise
      currency: "INR",
      receipt: `sub_${req.user?.id || "anon"}_${Date.now()}`,
      notes: { plan },
    });

    return res.json({
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      keyId: razorEnv.keyId,
      plan,
    });
  } catch (e) {
    console.error("[billing] createOrder error:", e);
    return res.status(500).json({ error: "Failed to create order" });
  }
}

// ✅ Confirm Payment
async function confirmPayment(req, res) {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      plan = "monthly",
    } = req.body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({ error: "Missing payment fields" });
    }

    // ✅ Verify Razorpay Signature
    const expectedSignature = crypto
      .createHmac("sha256", razorEnv.keySecret)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex");

    if (expectedSignature !== razorpay_signature) {
      return res.status(400).json({ error: "Signature verification failed" });
    }

    // ✅ Update User Plan
    if (req.user?.id) {
      const user = await User.findById(req.user.id);

      if (!user) return res.status(404).json({ error: "User not found" });

      user.subscriptionPlan = "PREMIUM"; // ✅ matches enum
      user.subscriptionType = plan === "yearly" ? "YEARLY" : "MONTHLY"; // optional field if you add later
      await user.save();

      console.log(`[billing] Subscription updated for user: ${user.email} (${plan})`);

      return res.json({
        ok: true,
        message: "Subscription activated successfully",
        user: {
          name: user.name,
          email: user.email,
          subscriptionPlan: user.subscriptionPlan,
          subscriptionType: user.subscriptionType,
        },
      });
    }

    return res.status(400).json({ error: "User not found" });
  } catch (e) {
    console.error("[billing] confirmPayment error:", e);
    return res.status(500).json({ error: "Payment verification failed" });
  }
}

module.exports = { createOrder, confirmPayment };

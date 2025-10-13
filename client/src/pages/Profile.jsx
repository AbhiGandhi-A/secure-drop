"use client"
import { useAuth } from "../context/AuthContext.jsx"
import api from "../api/client.js"
import { notify } from "../components/Notifications.jsx"

// Feature list data as per requirements
const PLAN_FEATURES = {
  FREE: { expiry: "24 hours", downloads: "5 max", detail: "Standard limits" },
  PREMIUM_MONTHLY: { expiry: "1 week", downloads: "20 max", detail: "Priority service" },
  PREMIUM_YEARLY: { expiry: "2 weeks", downloads: "Unlimited", detail: "Full access and best value" },
  ANON: { expiry: "6 hours", downloads: "3 max", detail: "For guests only" },
}

function loadRazorpay() {
  return new Promise((resolve) => {
    if (window.Razorpay) return resolve(true)
    const script = document.createElement("script")
    script.src = "https://checkout.razorpay.com/v1/checkout.js"
    script.onload = () => resolve(true)
    script.onerror = () => resolve(false)
    document.body.appendChild(script)
  })
}

function formatPlan(plan) {
  if (plan === "PREMIUM_MONTHLY") return "Premium Monthly"
  if (plan === "PREMIUM_YEARLY") return "Premium Yearly"
  if (plan === "FREE") return "Free"
  if (plan === "ANON") return "Guest"
  return plan || "FREE"
}

export default function Profile() {
  const { user, setUser } = useAuth()

  const currentPlan = user?.plan || "FREE"
  const features = PLAN_FEATURES[currentPlan] || PLAN_FEATURES.FREE

  const subscribe = async (plan) => {
    try {
      const loaded = await loadRazorpay()
      if (!loaded) {
        notify("Failed to load Razorpay", "error")
        return
      }

      const { data } = await api.post("/api/billing/create-order", { plan }) // 'monthly' or 'yearly'
      const { keyId, orderId, amount, currency } = data || {}
      if (!keyId || !orderId) {
        notify("Billing not configured (Server missing keys or prices)", "error")
        return
      }

      const options = {
        key: keyId,
        amount,
        currency,
        name: "Secure Drop",
        description: `Premium (${plan})`,
        order_id: orderId,
        prefill: { name: user?.name, email: user?.email },
        theme: { color: "#0ea5e9" },
        handler: async (response) => {
          try {
            const { data: confirmData } = await api.post("/api/billing/confirm", {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              plan, // 'monthly' or 'yearly'
            })
            if (confirmData.ok && confirmData.user) {
              // Update auth context with new plan
              setUser(confirmData.user)
              notify("Subscription activated!", "success")
            } else {
              throw new Error("Payment verification failed on server")
            }
          } catch (error) {
            console.error("Payment handler error:", error)
            notify("Payment verification failed", "error")
          }
        },
        modal: {
          ondismiss: () => {
            notify("Payment cancelled", "info")
          },
        },
      }

      const rzp = new window.Razorpay(options)
      rzp.open()
    } catch (e) {
      console.error("Create order failed:", e)
      notify(e?.response?.data?.error || "Failed to create order", "error")
    }
  }

  if (!user) return <div className="card narrow">Login to manage your account.</div>

  return (
    <div className="card narrow">
      <h2>Profile</h2>
      <div>
        <strong>Name:</strong> {user.name}
      </div>
      <div>
        <strong>Email:</strong> {user.email}
      </div>

      <hr />

      <h3>Your Plan: {formatPlan(currentPlan)}</h3>
      <div className="plan-features">
        <div>
          <strong>Max Expiry:</strong> {features.expiry}
        </div>
        <div>
          <strong>Max Downloads:</strong> {features.downloads}
        </div>
        <div className="muted">{features.detail}</div>
      </div>

      <h3>Upgrade</h3>
      <div className="row">
        <button
          className="btn-primary"
          onClick={() => subscribe("monthly")}
          disabled={currentPlan === "PREMIUM_MONTHLY" || currentPlan === "PREMIUM_YEARLY"}
        >
          Go Premium (Monthly)
        </button>
        <button className="btn-outline" onClick={() => subscribe("yearly")} disabled={currentPlan === "PREMIUM_YEARLY"}>
          Go Premium (Yearly)
        </button>
      </div>
    </div>
  )
}

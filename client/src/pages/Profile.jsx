"use client"

import { useAuth } from "../context/AuthContext.jsx"
import api from "../api/client.js"
import { notify } from "../components/Notifications.jsx"

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
  return plan || "FREE"
}

export default function Profile() {
  const { user, setUser } = useAuth()

  const subscribe = async (plan) => {
    try {
      const loaded = await loadRazorpay()
      if (!loaded) {
        notify("Failed to load Razorpay", "error")
        return
      }

      const { data } = await api.post("/api/billing/create-order", { plan })
      const { keyId, orderId, amount, currency } = data || {}

      if (!keyId || !orderId) {
        notify("Billing not configured", "error")
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
              plan,
            })

            // 💡 FIX: Use the updated user object returned from the server
            if (confirmData.ok && confirmData.user) {
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
      notify("Failed to create order or billing not configured", "error")
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
      <div>
        <strong>Plan:</strong> {formatPlan(user.plan)}
      </div>

      <h3>Upgrade</h3>
      <div className="row">
        <button className="btn-primary" onClick={() => subscribe("monthly")}>
          Go Premium (Monthly)
        </button>
        <button className="btn-outline" onClick={() => subscribe("yearly")}>
          Go Premium (Yearly)
        </button>
      </div>

      <div className="muted">Premium: larger files, longer expiry, no ads.</div>
    </div>
  )
}
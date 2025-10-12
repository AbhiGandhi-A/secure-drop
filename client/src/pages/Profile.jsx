// Profile.jsx

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
            const confirm = await api.post("/api/billing/confirm", {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              plan,
            })

            // 💡 FIX APPLIED HERE: Use the data returned from the server to update the user state.
            const updatedUser = confirm.data.user
            setUser({ 
                id: updatedUser._id,
                name: updatedUser.name,
                email: updatedUser.email,
                plan: updatedUser.subscriptionPlan // This will be "PREMIUM_MONTHLY" or "PREMIUM_YEARLY"
            })
            
            notify("Subscription activated!", "success")
          } catch {
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
      notify("Billing not configured", "error")
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
        {/* The plan name for display will now correctly come from the database value */}
        <strong>Plan:</strong> {user.plan || "FREE"} 
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
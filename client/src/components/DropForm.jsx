"use client"

import { useState } from "react"
import api from "../api/client.js"
import { notify } from "./Notifications.jsx"
import AdSlot from "./AdSlot.jsx"
import { useAuth } from "../context/AuthContext.jsx"

export default function DropForm() {
  const [message, setMessage] = useState("")
  const [file, setFile] = useState(null)
  const [expiresInHours, setExpires] = useState(24)
  const [maxDownloads, setMax] = useState(1)
  const [oneTime, setOneTime] = useState(false)
  const [result, setResult] = useState(null)
  const { user } = useAuth()

  const plan = user?.plan || "ANON"
  const maxByPlan = plan === "PREMIUM" ? 168 : plan === "FREE" ? 24 : 6

  const onSubmit = async (e) => {
    e.preventDefault()
    const fd = new FormData()
    fd.append("message", message)
    fd.append("expiresInHours", expiresInHours)
    fd.append("maxDownloads", oneTime ? 1 : maxDownloads)
    fd.append("oneTime", oneTime ? "true" : "false")
    if (file) fd.append("file", file)
    try {
      const { data } = await api.post("/api/drops/create", fd, { headers: { "Content-Type": "multipart/form-data" } })
      setResult(data)
      notify("PIN generated. Copy it and share securely.", "success")
    } catch (e) {
      notify(e?.response?.data?.error || "Failed to create drop", "error")
    }
  }

  const copyPin = async () => {
    if (!result?.pin) return
    await navigator.clipboard.writeText(result.pin)
    notify("PIN copied to clipboard", "success")
  }

  return (
    <div className="card">
      <h2>Create a Secure Drop</h2>
      <form onSubmit={onSubmit} className="form">
        <label>Message (optional)</label>
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          rows={4}
          placeholder="Write your message..."
        />
        <label>File (optional)</label>
        <input type="file" onChange={(e) => setFile(e.target.files?.[0] || null)} />
        <div className="row">
          <div>
            <label>Expires (hours)</label>
            <input
              type="number"
              min="1"
              max={maxByPlan}
              value={Math.min(expiresInHours, maxByPlan)}
              onChange={(e) => setExpires(Math.min(Number(e.target.value || 1), maxByPlan))}
            />
            <div className="muted">Max for your plan: {maxByPlan}h</div>
          </div>
          <div>
            <label>Max downloads</label>
            <input
              type="number"
              min="1"
              max="100"
              disabled={oneTime}
              value={maxDownloads}
              onChange={(e) => setMax(e.target.value)}
            />
          </div>
        </div>
        <label className="checkbox">
          <input type="checkbox" checked={oneTime} onChange={(e) => setOneTime(e.target.checked)} /> One-time download
        </label>
        <button className="btn-primary" type="submit">
          Send
        </button>
      </form>

      <AdSlot slotName="share-form" />

      {result && (
        <div className="pin-result">
          <div>
            <strong>PIN:</strong> <code>{result.pin}</code>
          </div>
          <div>Expires: {new Date(result.expiresAt).toLocaleString()}</div>
          <button className="btn-outline" onClick={copyPin}>
            Copy PIN
          </button>
        </div>
      )}
    </div>
  )
}

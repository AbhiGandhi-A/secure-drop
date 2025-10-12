"use client"

import { useState } from "react"
import api from "../api/client.js"
import { notify } from "./Notifications.jsx"

export default function UnlockForm() {
  const [pin, setPin] = useState("")
  const [data, setData] = useState(null)

  const view = async (e) => {
    e.preventDefault()
    try {
      const { data } = await api.post("/api/drops/view", { pin })
      setData(data)
      notify("Drop unlocked", "success")
    } catch (e) {
      notify(e?.response?.data?.error || "Invalid/expired PIN", "error")
      setData(null)
    }
  }

  const download = async () => {
    if (!data?.downloadToken) return notify("No file to download", "error")
    const url = `${api.defaults.baseURL}/api/drops/download?token=${encodeURIComponent(data.downloadToken)}`
    window.location.href = url
  }

  const copyMessage = async () => {
    if (!data?.message) return
    await navigator.clipboard.writeText(data.message)
    notify("Message copied", "success")
  }

  return (
    <div className="card">
      <h2>Unlock a Drop</h2>
      <form onSubmit={view} className="form">
        <label>Enter PIN</label>
        <input value={pin} onChange={(e) => setPin(e.target.value)} placeholder="6-8 chars" />
        <button className="btn-primary" type="submit">
          Unlock
        </button>
      </form>

      {data && (
        <div className="unlock-result">
          {data.message && (
            <div className="message-box">
              <label>Message</label>
              <pre className="message">{data.message}</pre>
              <button className="btn-outline" onClick={copyMessage}>
                Copy
              </button>
            </div>
          )}
          {data.file && (
            <div className="file-box">
              <div>
                <strong>File:</strong> {data.file.filename} • {(data.file.sizeBytes / 1024 / 1024).toFixed(2)} MB
              </div>
              <button className="btn-primary" onClick={download}>
                Download
              </button>
            </div>
          )}
          <div className="muted">
            Expires: {new Date(data.expiresAt).toLocaleString()} • Remaining downloads: {data.remainingDownloads}
          </div>
        </div>
      )}
    </div>
  )
}

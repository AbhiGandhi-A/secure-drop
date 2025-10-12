"use client"

import { useState } from "react"
import api from "../api/client.js"
import { notify } from "./Notifications.jsx"
import { useAuth } from "../context/AuthContext.jsx"

export default function Chatbot() {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState("")
  const [history, setHistory] = useState([])
  const { user } = useAuth()

  const send = async () => {
    if (!query.trim()) return
    const prev = { role: "user", content: query }
    setHistory((h) => [...h, prev])
    setQuery("")
    try {
      const { data } = await api.post("/api/chatbot/query", { query })
      setHistory((h) => [...h, { role: "assistant", content: data.response }])
    } catch (e) {
      notify("Chatbot error", "error")
    }
  }

  return (
    <>
      <button className="chat-fab" onClick={() => setOpen(true)}>
        Chat
      </button>
      {open && (
        <div className="modal-overlay" onClick={() => setOpen(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Assistant</h3>
              <button onClick={() => setOpen(false)}>×</button>
            </div>
            <div className="modal-body">
              <div className="chatlog">
                {history.map((m, i) => (
                  <div key={i} className={`msg ${m.role}`}>
                    {m.content}
                  </div>
                ))}
              </div>
              <div className="input-row">
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Ask about how to use the site..."
                />
                <button onClick={send}>Send</button>
              </div>
              <div className="muted">{user ? "Logged in" : "Anonymous"} • AI answers may be inaccurate</div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

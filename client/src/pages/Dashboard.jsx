"use client"
import { useEffect, useState } from "react"
import { useAuth } from "../context/AuthContext.jsx"
import { useNavigate } from "react-router-dom"
import api from "../api/client.js"
import DropCard from "../components/DropCard.jsx"
import SavedFiles from "../components/SavedFiles.jsx"
import { notify } from "../components/Notifications.jsx"

export default function Dashboard() {
  const { user, token } = useAuth()
  const nav = useNavigate()
  const [items, setItems] = useState([])

  useEffect(() => {
    if (!user || !token) nav("/login")
  }, [user, token])

  useEffect(() => {
    const run = async () => {
      try {
        const { data } = await api.get("/api/user/history")
        setItems(data)
      } catch {
        notify("Failed to load history", "error")
      }
    }
    if (token) run()
  }, [token])

  const onDelete = async (id) => {
    try {
      await api.delete(`/api/drops/${id}`)
      setItems((items) => items.map((i) => (i.id === id ? { ...i, isDeleted: true } : i)))
      notify("Drop deleted", "success")
    } catch {
      notify("Delete failed", "error")
    }
  }

  return (
    <div className="card">
      <h2>Your Drops</h2>
      <div className="list">
        {items.map((d) => (
          <DropCard key={d.id} d={d} onDelete={onDelete} />
        ))}
      </div>
      <SavedFiles />
    </div>
  )
}

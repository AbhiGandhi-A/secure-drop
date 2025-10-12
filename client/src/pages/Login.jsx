"use client"

import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { useAuth } from "../context/AuthContext.jsx"
import { notify } from "../components/Notifications.jsx"

export default function Login() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const { login } = useAuth()
  const nav = useNavigate()

  const onSubmit = async (e) => {
    e.preventDefault()
    try {
      await login(email, password)
      notify("Logged in", "success")
      nav("/dashboard")
    } catch (e) {
      notify(e?.response?.data?.error || "Login failed", "error")
    }
  }

  return (
    <div className="card narrow">
      <h2>Login</h2>
      <form onSubmit={onSubmit} className="form">
        <label>Email</label>
        <input value={email} onChange={(e) => setEmail(e.target.value)} />
        <label>Password</label>
        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
        <button className="btn-primary" type="submit">
          Login
        </button>
      </form>
    </div>
  )
}

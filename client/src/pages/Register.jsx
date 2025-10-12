"use client"

import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { useAuth } from "../context/AuthContext.jsx"
import { notify } from "../components/Notifications.jsx"

export default function Register() {
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const { register } = useAuth()
  const nav = useNavigate()

  const onSubmit = async (e) => {
    e.preventDefault()
    try {
      await register(name, email, password)
      notify("Account created", "success")
      nav("/dashboard")
    } catch (e) {
      notify(e?.response?.data?.error || "Registration failed", "error")
    }
  }

  return (
    <div className="card narrow">
      <h2>Create Account</h2>
      <form onSubmit={onSubmit} className="form">
        <label>Name</label>
        <input value={name} onChange={(e) => setName(e.target.value)} />
        <label>Email</label>
        <input value={email} onChange={(e) => setEmail(e.target.value)} />
        <label>Password</label>
        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
        <button className="btn-primary" type="submit">
          Sign Up
        </button>
      </form>
    </div>
  )
}

"use client"

import { createContext, useContext, useEffect, useState } from "react"
// 🚨 Ensure this import path is correct
import api, { setAuthToken } from "../api/client.js" 

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      // Reads 'user' key
      const cached = localStorage.getItem("user")
      return cached ? JSON.parse(cached) : null
    } catch {
      return null
    }
  })
  // Reads 'token' key
  const [token, setToken] = useState(localStorage.getItem("token") || null)
  const [loginAt, setLoginAt] = useState(Number(localStorage.getItem("loginAt") || 0))

  useEffect(() => {
    // 🚨 This call sets the header on the Axios instance
    setAuthToken(token) 
    if (!token) setUser(null)

    let timer
    if (token && loginAt) {
      const elapsed = Date.now() - loginAt
      const remaining = Math.max(0, 60 * 60 * 1000 - elapsed)
      timer = setTimeout(() => {
        logout()
      }, remaining)
    }
    return () => timer && clearTimeout(timer)
  }, [token, loginAt])

  useEffect(() => {
    try {
      if (user) localStorage.setItem("user", JSON.stringify(user))
      else localStorage.removeItem("user")
    } catch {}
  }, [user])

  const login = async (email, password) => {
    try {
      // 🚨 This is the correct API call
      const { data } = await api.post("/api/auth/login", { email, password })
      
      localStorage.setItem("token", data.token)
      localStorage.setItem("loginAt", String(Date.now()))
      localStorage.setItem("user", JSON.stringify(data.user))
      setToken(data.token)
      setLoginAt(Date.now())
      setUser(data.user)
      
      return data; // Return data for external handling (like in the Login component)
    } catch (error) {
      // Re-throw error so the Login component can catch it and display a notification
      throw error; 
    }
  }

  const register = async (name, email, password) => {
    const { data } = await api.post("/api/auth/register", { name, email, password })
    localStorage.setItem("token", data.token)
    localStorage.setItem("loginAt", String(Date.now()))
    localStorage.setItem("user", JSON.stringify(data.user))
    setToken(data.token)
    setLoginAt(Date.now())
    setUser(data.user)
  }

  const logout = () => {
    localStorage.removeItem("token")
    localStorage.removeItem("loginAt")
    localStorage.removeItem("user")
    setToken(null)
    setLoginAt(0)
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, setUser, token, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
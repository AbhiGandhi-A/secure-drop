import axios from "axios"

const API_BASE_URL = import.meta.env?.VITE_API_BASE_URL || "http://localhost:8080"

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: false,
})

export function setAuthToken(token) {
  if (token) {
    api.defaults.headers.common["Authorization"] = `Bearer ${token}`
  } else {
    delete api.defaults.headers.common["Authorization"]
  }
}

// Load token on initial file load (prevents 401s on first mount)
try {
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null
  if (token) {
    setAuthToken(token)
  }
} catch (e) {
  console.error("Error setting initial auth token:", e)
}

export default api

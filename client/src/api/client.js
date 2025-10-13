import axios from "axios"

// 🚨 Corrected: Use the same key 'token' that AuthProvider uses.
// Also, define the baseURL with the environment variable.
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: false,
});

// Function to set the Authorization header on the API instance
export function setAuthToken(token) {
  if (token) {
    api.defaults.headers.common["Authorization"] = `Bearer ${token}`
  } else {
    delete api.defaults.headers.common["Authorization"]
  }
}

// 🚨 Initial Load Check: Apply token from localStorage on file load
try {
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
  if (token) {
    setAuthToken(token);
  }
} catch (e) {
  console.error("Error setting initial auth token:", e);
}

export default api;
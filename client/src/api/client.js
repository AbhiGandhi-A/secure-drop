import axios from "axios";

// 🚨 ACTION REQUIRED: Verify VITE_API_BASE_URL is set to your Render URL.
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: false,
});

/**
 * Sets the Authorization header for all subsequent API calls.
 * This is called by AuthProvider whenever the token state changes.
 */
export function setAuthToken(token) {
  if (token) {
    api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
  } else {
    delete api.defaults.headers.common["Authorization"];
  }
}

// 🚨 Initial Load Check: Apply token from localStorage on file load
// This ensures that even before AuthProvider runs, the token is available if a request is made.
try {
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
  if (token) {
    setAuthToken(token);
  }
} catch (e) {
  console.error("Error setting initial auth token:", e);
}

export default api;
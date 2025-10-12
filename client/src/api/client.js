// Basic axios client
import axios from "axios"

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:8080",
  withCredentials: false,
})

try {
  const raw = typeof window !== "undefined" ? localStorage.getItem("auth") : null
  if (raw) {
    const { token, expiresAt } = JSON.parse(raw)
    const notExpired = !expiresAt || Date.now() < Number(expiresAt)
    if (token && notExpired) {
      // set default header for axios instance
      // reusing same logic as setAuthToken but inlined to avoid circular import
      // eslint-disable-next-line no-undef
      // ensure we reference the same api instance exported by this module
      // If you rename 'api', keep this in sync.
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      // (typescript comments are harmless in JS; leaving as hints)
      // set header:
      // NOTE: api is defined above in this file
      // eslint-disable-next-line no-undef
      // final set:
      // prettier-ignore
      api &&
        api.defaults &&
        api.defaults.headers &&
        api.defaults.headers.common &&
        (api.defaults.headers.common["Authorization"] = `Bearer ${token}`)
    }
  }
} catch (e) {
  // ignore parse errors
}

export function setAuthToken(token) {
  if (token) {
    api.defaults.headers.common["Authorization"] = `Bearer ${token}`
  } else {
    delete api.defaults.headers.common["Authorization"]
  }
}

export default api

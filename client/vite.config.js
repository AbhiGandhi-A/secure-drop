import { defineConfig } from "vite"
import react from "@vitejs/plugin-react"

export default defineConfig({
  plugins: [react()],
  // Ensure absolute asset paths on Vercel (prevents CSS/JS from being rewritten to index.html)
  base: "/",
  server: {
    port: 5173,
    // Local dev convenience: proxy API calls to your backend on :8080
    proxy: {
      "/api": {
        target: "http://localhost:8080",
        changeOrigin: true,
      },
    },
  },
  build: {
    outDir: "dist",
  },
})

import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// ✅ important: base must be "/"
export default defineConfig({
  plugins: [react()],
  base: "/",  // this fixes broken asset URLs on Vercel
  build: {
    outDir: "dist"
  }
})

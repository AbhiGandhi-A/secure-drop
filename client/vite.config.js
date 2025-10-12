import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  base: "./", // ✅ relative paths for CSS/JS
  build: {
    outDir: "dist",
    assetsDir: "assets", 
  },
});

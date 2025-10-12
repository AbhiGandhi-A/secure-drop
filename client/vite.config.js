import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  base: "./", // ✅ critical for correct asset path
  build: {
    outDir: "dist",
    assetsDir: "assets", // ✅ ensures CSS & JS go inside assets/
  },
  server: {
    port: 5173,
  },
});

import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      "/api": {
        target: "http://localhost:3000",
      },
      "/socket.io": {
        target: "http://localhost:3000",
        ws: true,
      },
    },
  },
});

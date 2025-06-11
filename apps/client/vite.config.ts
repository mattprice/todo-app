import react from "@vitejs/plugin-react";
import { defineConfig, loadEnv } from "vite";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, "../../", "");

  const CLIENT_PORT = parseInt(env.CLIENT_PORT) || 5173;
  const SERVER_PORT = env.SERVER_PORT || 3000;
  const BACKEND_URL = `http://localhost:${SERVER_PORT}`;

  return {
    plugins: [react()],
    server: {
      port: CLIENT_PORT,
      strictPort: true,
      proxy: {
        "/api": {
          target: BACKEND_URL,
        },
        "/socket.io": {
          target: BACKEND_URL,
          ws: true,
        },
      },
    },
  };
});

import react from "@vitejs/plugin-react";
import path from "path";
import { fileURLToPath } from "url";
import { defineConfig } from "vite";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Toggle between local and staging
// Set to true for local development, false for staging
const USE_LOCAL = false;

const API_TARGET = USE_LOCAL
  ? "http://localhost:8000"
  : "https://rzerp-api.socia-dev.com";

// Common proxy configuration
const createProxyConfig = () => ({
  target: API_TARGET,
  changeOrigin: true,
  secure: false,
  configure: (proxy: any, _options: any) => {
    proxy.on("proxyRes", (proxyRes: any) => {
      const setCookieHeaders = proxyRes.headers["set-cookie"];
      if (setCookieHeaders) {
        proxyRes.headers["set-cookie"] = setCookieHeaders.map(
          (cookie: string) => cookie.replace(/Domain=[^;]+;?/gi, "")
        );
      }
    });
  },
});

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    proxy: {
      "/api": createProxyConfig(),
      "/csrf-cookie": createProxyConfig(),
      "/sanctum/csrf-cookie": createProxyConfig(),
    },
  },
  preview: {
    allowedHosts: ["rz-erp.socia-dev.com", "localhost", "127.0.0.1"],
  },
});

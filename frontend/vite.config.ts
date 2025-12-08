import react from "@vitejs/plugin-react";
import path from "path";
import { defineConfig } from "vite";

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
      "/api": {
        target:
          process.env.APP_TARGET ||
          process.env.LARAVEL_TARGET ||
          "http://localhost:8000",
        changeOrigin: true,
        secure: false,
        configure: (proxy, _options) => {
          proxy.on("proxyRes", (proxyRes) => {
            const setCookieHeaders = proxyRes.headers["set-cookie"];
            if (setCookieHeaders) {
              proxyRes.headers["set-cookie"] = setCookieHeaders.map((cookie) =>
                cookie.replace(/Domain=[^;]+;?/gi, "")
              );
            }
          });
        },
      },
      "/csrf-cookie": {
        target:
          process.env.APP_TARGET ||
          process.env.LARAVEL_TARGET ||
          "http://localhost:8000",
        changeOrigin: true,
        secure: false,
        configure: (proxy, _options) => {
          proxy.on("proxyRes", (proxyRes) => {
            const setCookieHeaders = proxyRes.headers["set-cookie"];
            if (setCookieHeaders) {
              proxyRes.headers["set-cookie"] = setCookieHeaders.map((cookie) =>
                cookie.replace(/Domain=[^;]+;?/gi, "")
              );
            }
          });
        },
      },
      "/sanctum/csrf-cookie": {
        target:
          process.env.APP_TARGET ||
          process.env.LARAVEL_TARGET ||
          "http://localhost:8000",
        changeOrigin: true,
        secure: false,
        configure: (proxy, _options) => {
          proxy.on("proxyRes", (proxyRes) => {
            const setCookieHeaders = proxyRes.headers["set-cookie"];
            if (setCookieHeaders) {
              proxyRes.headers["set-cookie"] = setCookieHeaders.map((cookie) =>
                cookie.replace(/Domain=[^;]+;?/gi, "")
              );
            }
          });
        },
      },
    },
  },
});

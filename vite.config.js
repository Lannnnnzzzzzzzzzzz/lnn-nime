import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],

  server: {
    port: 3000,
    proxy: {
      "/sankanime/api": {
        target: "https://www.sankavollerei.com",
        changeOrigin: true,
        secure: false,
        // hapus prefix "/sankanime/api" -> jadi root "/"
        rewrite: (path) => path.replace(/^\/sankanime\/api/, ""),
        configure: (proxy, options) => {
          proxy.on("proxyReq", (proxyReq, req, res) => {
            proxyReq.setHeader("Origin", "https://lnn-nime.vercel.app");
            proxyReq.setHeader("Referer", "https://lnn-nime.vercel.app/");

            proxyReq.setHeader(
              "User-Agent",
              "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"
            );

            console.log(
              `[VITE PROXY] Meneruskan permintaan ke: ${req.method} ${req.url} dengan header baru`
            );
          });
          proxy.on("error", (err, req, res) => {
            console.error("[VITE PROXY] Terjadi error:", err);
          });
        },
      },
    },
  },

  build: {
    outDir: "dist",
    minify: "terser",
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
      },
    },
    rollupOptions: {
      output: {
        assetFileNames: "assets/[name]-[hash].[ext]",
        chunkFileNames: "assets/[name]-[hash].js",
        entryFileNames: "assets/[name]-[hash].js",
      },
    },
  },

  base: "/",
});

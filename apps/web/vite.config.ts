import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  // @nivora/shared is a pnpm-workspace symlink whose "main" points at a
  // compiled CommonJS dist/index.js. Vite serves linked packages straight
  // off disk via /@fs/ and skips its normal CJS->ESM interop for them,
  // so without this it fails at runtime with "does not provide an export
  // named ...". optimizeDeps.include forces it through esbuild's
  // pre-bundling step, which does the interop correctly.
  optimizeDeps: {
    include: ["@nivora/shared"],
  },
  server: {
    port: 5173,
    proxy: {
      "/api": {
        target: process.env.API_URL ?? "http://localhost:3000",
        changeOrigin: true,
      },
    },
  },
});

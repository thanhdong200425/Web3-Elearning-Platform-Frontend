import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tsconfigPaths from "vite-tsconfig-paths";
import tailwindcss from "@tailwindcss/vite";
import { nodePolyfills } from "vite-plugin-node-polyfills";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tsconfigPaths(),
    tailwindcss(),
    nodePolyfills({
      // Enable polyfills for Node.js modules
      globals: {
        Buffer: true,
        global: true,
        process: true,
      },
      protocolImports: true,
    }),
  ],
  server: {
    allowedHosts: ["43a4ff11c9a7.ngrok-free.app"],
  },
  define: {
    global: "globalThis",
    "process.env": {},
  },
  resolve: {
    alias: {
      buffer: "buffer",
    },
  },
  optimizeDeps: {
    esbuildOptions: {
      define: {
        global: "globalThis",
      },
    },
  },
});

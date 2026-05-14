/// <reference types="vitest/config" />
import path from "node:path";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  resolve: {
    alias: { "@": path.resolve(__dirname, "src") },
  },
  plugins: [
    react(),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: ["vite.svg"],
      manifest: {
        name: "75 sustained",
        short_name: "75 sustained",
        description: "Track your custom seventy-five day challenge",
        display: "standalone",
        background_color: "#0f172a",
        theme_color: "#0f172a",
        start_url: "/",
        scope: "/",
        icons: [
          {
            src: "/vite.svg",
            sizes: "any",
            type: "image/svg+xml",
            purpose: "any",
          },
        ],
      },
    }),
  ],
  test: {
    globals: true,
    environment: "node",
    include: ["src/**/*.test.ts"],
  },
});

import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: "prompt",
      includeAssets: [
        "logo-error.png",
        "favicon.png",
        "apple-touch-icon.png",
        "robots.txt",
      ],
      manifest: {
        name: "ERROR — teste de interpretação",
        short_name: "ERROR",
        description:
          "Jogo de perguntas, pegadinhas e raciocínio lateral. Desconfie do óbvio.",
        lang: "pt-BR",
        dir: "ltr",
        start_url: "/",
        scope: "/",
        display: "standalone",
        orientation: "portrait-primary",
        theme_color: "#070909",
        background_color: "#070909",
        categories: ["games", "entertainment", "puzzle"],
        icons: [
          {
            src: "/icons/icon-192.png",
            sizes: "192x192",
            type: "image/png",
            purpose: "any",
          },
          {
            src: "/icons/icon-512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "any",
          },
          {
            src: "/icons/maskable-512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "maskable",
          },
        ],
        shortcuts: [
          {
            name: "Jogar agora",
            short_name: "Jogar",
            url: "/jogar",
            icons: [{ src: "/icons/icon-192.png", sizes: "192x192" }],
          },
          {
            name: "Ranking",
            short_name: "Ranking",
            url: "/ranking",
            icons: [{ src: "/icons/icon-192.png", sizes: "192x192" }],
          },
        ],
      },
      workbox: {
        globPatterns: ["**/*.{js,css,html,png,svg,woff2,webp}"],
        navigateFallback: "/index.html",
        navigateFallbackDenylist: [/^\/api\//],
        cleanupOutdatedCaches: true,
        clientsClaim: true,
        skipWaiting: false,
      },
      devOptions: {
        enabled: false,
      },
    }),
  ],
  server: {
    port: 5173,
    strictPort: true,
    proxy: {
      "/api": {
        target: "http://localhost:3333",
        changeOrigin: true,
      },
    },
  },
  preview: {
    port: 4173,
    proxy: {
      "/api": {
        target: "http://localhost:3333",
        changeOrigin: true,
      },
    },
  },
});

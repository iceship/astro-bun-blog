// @ts-check

import cloudflare from "@astrojs/cloudflare";
import preact from "@astrojs/preact";
import sitemap from "@astrojs/sitemap";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "astro/config";

import astroExpressiveCode from "astro-expressive-code";

// https://astro.build/config
export default defineConfig({
  site: "https://blog.iceship.dev",
  adapter: cloudflare({ imageService: "compile" }),
  integrations: [
    preact(),
    sitemap(),
    astroExpressiveCode({
      themes: ["dracula", "nord"],

      frames: {
        showCopyToClipboardButton: true,
      },
    }),
  ],
  prefetch: {
    defaultStrategy: "viewport",
    prefetchAll: true,
  },
  experimental: {
    clientPrerender: true,
  },
  image: {
    responsiveStyles: true,
  },
  vite: {
    plugins: [tailwindcss()],
  },
});

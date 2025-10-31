// @ts-check

import cloudflare from "@astrojs/cloudflare";
import preact from "@astrojs/preact";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "astro/config";

import icon from "astro-icon";

// https://astro.build/config
export default defineConfig({
  site: "https://blog.iceship.dev",
  adapter: cloudflare({ imageService: "compile" }),
  integrations: [preact(), icon()],
  prefetch: {
    defaultStrategy: "viewport",
    prefetchAll: true,
  },
  vite: {
    plugins: [tailwindcss()],
  },
  markdown: {
    syntaxHighlight: "shiki",
    shikiConfig: {
      themes: {
        light: "github-light",
        dark: "github-dark",
      },
      defaultColor: "light-dark()",
    },
  },
});

// @ts-check

import cloudflare from "@astrojs/cloudflare";
import preact from "@astrojs/preact";
import { defineConfig } from "astro/config";

import tailwindcss from "@tailwindcss/vite";

// https://astro.build/config
export default defineConfig({
  site: "https://blog.iceship.dev",
  adapter: cloudflare(),
  integrations: [preact()],

  vite: {
    plugins: [tailwindcss()],
  },
});
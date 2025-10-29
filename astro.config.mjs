// @ts-check

import cloudflare from "@astrojs/cloudflare";
import react from "@astrojs/react";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "astro/config";

// https://astro.build/config
export default defineConfig({
  site: "https://blog.iceship.dev",
  adapter: cloudflare(),
  integrations: [react()],

  vite: {
    plugins: [tailwindcss()],
  },
});

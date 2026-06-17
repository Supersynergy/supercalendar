// @ts-check
import cloudflare from "@astrojs/cloudflare";
import react from "@astrojs/react";
import tailwind from "@tailwindcss/vite";
import { defineConfig } from "astro/config";

// Server output on the Cloudflare adapter → static pages are prerendered, API
// routes run as Cloudflare Pages Functions. Deploy target: `dist/` → CF Pages.
export default defineConfig({
  output: "server",
  adapter: cloudflare({
    platformProxy: { enabled: true }, // local `astro dev` sees CF bindings/env
  }),
  integrations: [react()],
  vite: { plugins: [tailwind()] },
});

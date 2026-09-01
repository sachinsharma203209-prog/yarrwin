// @ts-check
import { defineConfig } from "astro/config";
import sitemap from "@astrojs/sitemap";
import tailwindcss from "@tailwindcss/vite";

/**
 * Yarrwin — production Astro config.
 *
 * - Static output (default) → every page ships as pre-rendered HTML.
 * - `site` drives canonical URLs, OpenGraph absolute URLs, JSON-LD and the sitemap.
 * - @astrojs/sitemap emits /sitemap-index.xml + /sitemap-0.xml at build time.
 * - Tailwind CSS v4 runs as a Vite plugin (CSS-first config in src/styles/global.css).
 */
export default defineConfig({
  site: "https://sachinsharma203209-prog.github.io",
  base: "/yarrwin/",
  trailingSlash: "ignore",
  integrations: [sitemap()],
  vite: {
    plugins: [tailwindcss()],
  },
  build: {
    // Inline small stylesheets for fewer requests; keep large ones external for caching.
    inlineStylesheets: "auto",
  },
});

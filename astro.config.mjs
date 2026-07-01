import { defineConfig } from "astro/config";
import react from "@astrojs/react";
import tailwindcss from "@tailwindcss/vite";

// https://astro.build
export default defineConfig({
  site: "https://lovethisartist.studio",
  redirects: {
    "/commission": "/commission/monthlys",
  },
  integrations: [react()],
  image: {
    // Keep AVIF thumbnails small + high quality; hi-res JPEGs are linked out.
    responsiveStyles: true,
  },
  vite: {
    plugins: [tailwindcss()],
  },
});

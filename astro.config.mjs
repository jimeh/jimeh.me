import { defineConfig, fontProviders } from "astro/config";
import sitemap from "@astrojs/sitemap";
import icon from "astro-icon";

export default defineConfig({
  site: "https://jimeh.me",
  integrations: [sitemap(), icon()],
  experimental: {
    fonts: [
      {
        provider: fontProviders.google(),
        name: "Open Sans",
        cssVariable: "--font-open-sans",
        weights: [400, 700],
        styles: ["normal", "italic"],
        fallbacks: ["helvetica", "arial", "sans-serif"],
      },
    ],
  },
});

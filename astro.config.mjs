import { defineConfig, fontProviders } from "astro/config";
import sitemap from "@astrojs/sitemap";
import icon from "astro-icon";

export default defineConfig({
  site: "https://jimeh.me",
  integrations: [sitemap(), icon()],
  experimental: {
    fonts: [
      {
        provider: fontProviders.local(),
        name: "Open Sans",
        cssVariable: "--font-open-sans",
        fallbacks: ["helvetica", "arial", "sans-serif"],
        options: {
          variants: [
            {
              weight: "300 800",
              style: "normal",
              stretch: "75% 100%",
              src: [
                "@fontsource-variable/open-sans/files/open-sans-latin-wdth-normal.woff2",
              ],
            },
          ],
        },
      },
    ],
  },
});

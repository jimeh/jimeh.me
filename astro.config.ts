import { defineConfig, fontProviders } from "astro/config";
import tailwindcss from "@tailwindcss/vite";
import mdx from "@astrojs/mdx";
import sitemap from "@astrojs/sitemap";
import icon from "astro-icon";
import rehypePrettyCode from "rehype-pretty-code";
import { remarkAlert } from "remark-github-blockquote-alert";
import { rehypeDeadLinks } from "./src/plugins/rehype-dead-links";

export default defineConfig({
  site: "https://jimeh.me",
  image: {
    dangerouslyProcessSVG: true,
    remotePatterns: [{ protocol: "https" }],
  },
  integrations: [mdx(), sitemap(), icon()],
  vite: {
    plugins: [tailwindcss()],
  },
  markdown: {
    syntaxHighlight: false,
    remarkPlugins: [remarkAlert],
    rehypePlugins: [
      rehypeDeadLinks,
      [
        rehypePrettyCode,
        {
          theme: { light: "one-light", dark: "one-dark-pro" },
          keepBackground: false,
        },
      ],
    ],
  },
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
});

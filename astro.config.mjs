import { defineConfig, fontProviders } from "astro/config";
import tailwindcss from "@tailwindcss/vite";
import mdx from "@astrojs/mdx";
import sitemap from "@astrojs/sitemap";
import icon from "astro-icon";
import { readdirSync } from "node:fs";
import rehypePrettyCode from "rehype-pretty-code";
import { remarkAlert } from "remark-github-blockquote-alert";

const datedBlogDirRe = /^(?<year>\d{4})-\d{2}-\d{2}-(?<slug>.+)$/;

function blogPostRedirects() {
  return Object.fromEntries(
    readdirSync("src/content/blog", { withFileTypes: true })
      .filter((entry) => entry.isDirectory())
      .map((entry) => {
        const match = entry.name.match(datedBlogDirRe);
        if (!match?.groups) {
          return null;
        }

        const { year, slug } = match.groups;
        return [`/blog/${entry.name}/`, `/blog/${year}/${slug}/`];
      })
      .filter(Boolean),
  );
}

export default defineConfig({
  site: "https://jimeh.me",
  redirects: blogPostRedirects(),
  image: {
    dangerouslyAllowSVG: true,
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

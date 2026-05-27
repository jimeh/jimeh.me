import { defineConfig } from "mdxlint";

export default defineConfig({
  settings: {
    bullet: "-",
  },
  plugins: [
    "remark-frontmatter",
    "remark-gfm",
    "remark-lint",
    ["remark-lint-maximum-line-length", 80],
    ["remark-lint-mdx-jsx-quote-style", '"'],
    "remark-lint-mdx-jsx-self-close",
    "remark-lint-mdx-jsx-unique-attribute-name",
  ],
});

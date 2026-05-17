export default {
  "**/*": "prettier --check --ignore-unknown",
  "**/*.{astro,js,mjs,cjs,ts,tsx}": "eslint",
  "**/*.md": "markdownlint-cli2 --no-globs",
  "**/*.mdx": ["mdxlint --quiet", "eslint"],
  "src/**/*.css": "stylelint",
};

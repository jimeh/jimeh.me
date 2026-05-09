export default {
  "**/*": "prettier --check --ignore-unknown",
  "**/*.{astro,js,mjs,cjs,ts,tsx}": "eslint",
  "**/*.{md,mdx}": "markdownlint-cli2 --no-globs",
  "src/**/*.css": "stylelint",
};

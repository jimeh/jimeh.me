import js from "@eslint/js";
import tseslint from "typescript-eslint";
import eslintPluginAstro from "eslint-plugin-astro";
import * as mdx from "eslint-plugin-mdx";
import eslintConfigPrettier from "eslint-config-prettier/flat";

export default [
  { ignores: ["dist/", ".astro/", "node_modules/"] },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  ...eslintPluginAstro.configs.recommended,
  mdx.flat,
  {
    files: ["**/*.{md,mdx}"],
    rules: {
      "@typescript-eslint/no-unused-vars": "off",
    },
  },
  eslintConfigPrettier,
];

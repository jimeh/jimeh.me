/** @type {import("stylelint").Config} */
export default {
  extends: ["stylelint-config-standard", "stylelint-prettier/recommended"],
  ignoreFiles: ["dist/**", ".astro/**", "node_modules/**"],
  rules: {
    "at-rule-no-unknown": [
      true,
      {
        ignoreAtRules: ["theme", "layer", "apply", "utility"],
      },
    ],
    "import-notation": null,
  },
};

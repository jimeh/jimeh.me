/** @type {import("stylelint").Config} */
export default {
  extends: ["stylelint-config-standard", "stylelint-prettier/recommended"],
  ignoreFiles: ["dist/**", ".astro/**", "node_modules/**"],
  rules: {
    "at-rule-no-unknown": [
      true,
      {
        ignoreAtRules: [
          "theme",
          "custom-variant",
          "layer",
          "apply",
          "utility",
          "plugin",
        ],
      },
    ],
    "no-invalid-position-at-import-rule": [
      true,
      {
        ignoreAtRules: ["plugin"],
      },
    ],
    "import-notation": null,
  },
};

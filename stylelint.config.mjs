/** @type {import("stylelint").Config} */
export default {
  extends: ["stylelint-config-standard", "stylelint-prettier/recommended"],
  ignoreFiles: ["dist/**", ".astro/**", "node_modules/**"],
};

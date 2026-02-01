/** @type {import("stylelint").Config} */
export default {
  extends: ["stylelint-config-standard-scss"],
  ignoreFiles: ["dist/**", ".astro/**", "node_modules/**"],
};

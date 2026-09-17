/**
 * ESLint flat config (ESLint 9). Lints hand-written JS (tests, config
 * files); emitted build output and .ts sources (handled by tsc) are
 * ignored. Add typescript-eslint later if .ts rule coverage is wanted.
 */
import globals from "globals";

export default [
  {
    ignores: [
      "node_modules/",
      "coverage/",
      "shared/*.js",
      "shared/*.d.ts",
      "games/**/*.js",
      "games/**/*.d.ts",
      "dist/",
      "packages/**/*.js",
    ],
  },
  {
    files: ["tests/**/*.js", "*.js"],
    languageOptions: {
      ecmaVersion: 2025,
      sourceType: "module",
      globals: globals.node,
    },
    rules: {
      "no-undef": "error",
      "no-unused-vars": ["error", { argsIgnorePattern: "^_" }],
      eqeqeq: ["error", "always"],
      "prefer-const": "error",
    },
  },
];

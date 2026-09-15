/**
 * ESLint flat config (ESLint 9). Lints hand-written JS (tests, config
 * files); emitted build output and .ts sources (handled by tsc) are
 * ignored. Add typescript-eslint later if .ts rule coverage is wanted.
 */
export default [
  {
    ignores: [
      "node_modules/",
      "coverage/",
      "shared/*.js",
      "shared/*.d.ts",
      "games/**/*.js",
      "games/**/*.d.ts",
    ],
  },
  {
    files: ["tests/**/*.js", "*.js"],
    languageOptions: {
      ecmaVersion: 2023,
      sourceType: "module",
    },
    rules: {
      "no-undef": "error",
      "no-unused-vars": ["error", { argsIgnorePattern: "^_" }],
      eqeqeq: ["error", "always"],
      "prefer-const": "error",
    },
  },
];

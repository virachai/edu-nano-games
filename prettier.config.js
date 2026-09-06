export default {
  printWidth: 80,
  tabWidth: 2,
  useTabs: false,
  semi: true,
  singleQuote: false,
  trailingComma: "es5",
  arrowParens: "always",
  overrides: [
    {
      files: "*.json",
      options: {
        printWidth: 120
      }
    }
  ]
};

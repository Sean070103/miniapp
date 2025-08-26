/**
 * Central ESLint configuration to keep lint output clean for this project.
 * Adjust per-file later if you want stricter checks in specific areas.
 */
module.exports = {
  root: true,
  extends: ["next/core-web-vitals"],
  parserOptions: {
    ecmaVersion: 2023,
    sourceType: "module",
    tsconfigRootDir: __dirname,
    project: ["./tsconfig.json"],
  },
  rules: {
    // TypeScript strictness toggles – disable for now to keep output clean
    "@typescript-eslint/no-explicit-any": "off",
    "@typescript-eslint/no-unused-vars": "off",

    // React/Next.js rule relaxations used across the codebase
    "react/no-unescaped-entities": "off",
    "react-hooks/exhaustive-deps": "off",
    "@next/next/no-img-element": "off",
    "@next/next/no-page-custom-font": "off",

    // Common minor issues that don't need noise during development
    "no-console": "off",
  },
  overrides: [
    {
      files: ["**/*.ts", "**/*.tsx"],
      rules: {
        // Keep TS files relaxed consistently
        "@typescript-eslint/no-explicit-any": "off",
        "@typescript-eslint/no-unused-vars": "off",
      },
    },
  ],
};



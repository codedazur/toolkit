module.exports = {
  extends: [
    "eslint:recommended",
    "plugin:@typescript-eslint/eslint-recommended",
    "plugin:@typescript-eslint/recommended",
    "next",
    "turbo",
    "prettier",
  ],
  parser: "@typescript-eslint/parser",
  ignorePatterns: ["dist", "cdk.out", "**/*.tsbuildinfo"],
};

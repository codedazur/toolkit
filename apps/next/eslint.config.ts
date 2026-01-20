import { next } from "@codedazur/eslint-config/next";
import { defineConfig } from "eslint/config";
import root from "../../eslint.config";

export default defineConfig(root, next, {
  rules: {
    "turbo/no-undeclared-env-vars": "off",
  },
});

import { distribution, react } from "@codedazur/eslint-config";
import { defineConfig } from "eslint/config";
import root from "../../eslint.config";

export default defineConfig(root, react, distribution, {
  rules: {
    "react-hooks/set-state-in-effect": "off",
  },
});

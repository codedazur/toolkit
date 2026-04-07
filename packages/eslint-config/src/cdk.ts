import cdkPlugin from "eslint-plugin-awscdk";
import { defineConfig } from "eslint/config";

export const cdk = defineConfig(
  cdkPlugin.configs.recommended,
  {
    rules: {
      "awscdk/no-parent-name-construct-id-match": "off",
      "awscdk/construct-constructor-property": "off",
      "awscdk/no-unused-props": "off",
    },
  },
  {
    ignores: ["cdk.out/**/*"],
  },
);

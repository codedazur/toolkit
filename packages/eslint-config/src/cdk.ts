import cdkPlugin from "eslint-plugin-awscdk";
import { Config, defineConfig } from "eslint/config";

export const cdk = defineConfig(cdkPlugin.configs.recommended as Config[], {
  rules: {
    "awscdk/no-parent-name-construct-id-match": "off",
    "awscdk/construct-constructor-property": "off",
    "awscdk/no-unused-props": "off",
  },
});

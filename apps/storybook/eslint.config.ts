import { react } from "@codedazur/eslint-config/react";
import { storybook } from "@codedazur/eslint-config/storybook";
import { defineConfig } from "eslint/config";
import root from "../../eslint.config";

export default defineConfig(root, react, storybook);

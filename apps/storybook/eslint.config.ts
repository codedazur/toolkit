import { react, storybook } from "@codedazur/eslint-config";
import { defineConfig } from "eslint/config";
import root from "../../eslint.config";

export default defineConfig(root, react, storybook);

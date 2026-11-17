import { distribution } from "@codedazur/eslint-config";
import { cdk } from "@codedazur/eslint-config/cdk";
import { defineConfig } from "eslint/config";
import root from "../../eslint.config";

export default defineConfig(root, cdk, distribution);

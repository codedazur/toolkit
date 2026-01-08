import { defineConfig } from "eslint/config";
import root from "../../eslint.config";
import distribution from "./src/distribution";

export default defineConfig(root, distribution);

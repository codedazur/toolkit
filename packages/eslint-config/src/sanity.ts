import studio from "@sanity/eslint-config-studio";
import { defineConfig } from "eslint/config";
import react from "./react";

export default defineConfig(react, studio);

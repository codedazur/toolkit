/**
 * The @sanity/eslint-config-studio module does not include type definitions,
 * so we declare them manually here.
 */
declare module "@sanity/eslint-config-studio" {
  import { Linter } from "eslint";
  const config: Linter.Config[];
  export default config;
}

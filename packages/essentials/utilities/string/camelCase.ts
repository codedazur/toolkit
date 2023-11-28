import { pascalCase } from "./pascalCase";

/**
 * Converts a string to camelCase.
 *
 * @todo Improve the performance of this function by not calling pascalCase.
 */
export function camelCase(string: string) {
  return pascalCase(string).replace(/^[A-Z]/, (first) => first.toLowerCase());
}

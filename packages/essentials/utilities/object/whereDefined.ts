import { filterObject } from "./filterObject";

/**
 * Removes properties from an object that are `null` or `undefined`.
 */
export type WhereDefined<T> = {
  [P in keyof T]-?: NonNullable<T[P]>;
};

/**
 * Removes properties from an object that are `null` or `undefined`.
 */
export function whereDefined<T extends Record<string, unknown>>(
  object: T,
): WhereDefined<T> {
  return filterObject(
    object,
    ([, value]) => value !== undefined && value !== null,
  );
}

/**
 * Copies and object, omitting the specified keys and keeping the rest.
 *
 * @example omit({ a: 1, b: 2, c: 3 }, ["a"]) = { b: 2, c: 3 }
 */
export function omit<T extends object, K extends keyof T>(
  record: T,
  keys: K[],
): Omit<T, K> {
  return Object.fromEntries(
    Object.entries(record).filter(([key]) => !keys.includes(key as K)),
  ) as Omit<T, K>;
}

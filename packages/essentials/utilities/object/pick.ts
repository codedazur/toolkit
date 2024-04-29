/**
 * Copies an object, keeping only the specified keys and discarding the rest.
 *
 * @example pick({ a: 1, b: 2, c: 3 }, ["a"]) = { a: 1 }
 */
export function pick<T extends object, K extends keyof T>(
  record: T,
  keys: K[],
): Pick<T, K> {
  return Object.fromEntries(
    Object.entries(record).filter(([key]) => keys.includes(key as K)),
  ) as Pick<T, K>;
}

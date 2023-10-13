/**
 * This function takes an object and an array of keys as arguments and returns a new object with only the keys from the array. The function is generic so it can be used with any type of object.
 * @param record - An object
 * @param keys  - An array of keys to pick from the object
 * @returns
 * pick({ a: 1, b: 2, c: 3 }, ["a"]); // { a: 1 }
 */

export function pick<T extends object, K extends keyof T>(
  record: T,
  keys: K[],
): Pick<T, K> {
  return Object.fromEntries(
    Object.entries(record).filter(([key]) => keys.includes(key as K)),
  ) as Pick<T, K>;
}

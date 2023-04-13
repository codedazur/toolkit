/**
 * The code below is a function that takes an object and an array of keys, 
 * and returns a new object that has the same keys as the original object 
 * except for the keys found in the array. It uses Object.fromEntries() to 
 * convert an array of key-value pairs to an object and Object.entries() to 
 * convert an object to an array of key-value pairs.
 * @param record - An object
 * @param keys  - Array of keys to omit
 * @returns 
 * omit({ a: 1, b: 2, c: 3 }, ["a"]); // { b: 2, c: 3 }
 */

export function omit<T extends object, K extends keyof T>(
  record: T,
  keys: K[]
): Omit<T, K> {
  return Object.fromEntries(
    Object.entries(record).filter(([key]) => !keys.includes(key as K))
  ) as Omit<T, K>;
}

import { mapObject } from "./mapObject";

/**
 * Mutates the keys and values of an object by mapping each entry to a new
 * key-value pair using a callback function and constructing a new object from
 * the resulting array of entries.
 */
export function mutateObject<
  T extends object,
  K extends string | number | symbol,
  U,
>(object: T, callback: (entry: [keyof T, T[keyof T]]) => [K, U]): Record<K, U> {
  return Object.fromEntries(mapObject(object, callback)) as Record<K, U>;
}

import { mutateObject } from "./mutateObject";

/**
 * Changes the values of an object by mutating the object using a callback
 * function or a single value. The keys of the object are preserved.
 */
export function revalueObject<T extends Record<keyof any, any>, U>(
  object: T,
  callback: U | ((entry: [keyof T, T[keyof T]]) => U),
): { [K in keyof T]: U } {
  return mutateObject(object, ([key, value]) => [
    key,
    callback instanceof Function ? callback([key, value]) : callback,
  ]) as { [K in keyof T]: U };
}

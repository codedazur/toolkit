import { mutateObject } from "./mutateObject";

/**
 * Changes the keys of an object by mutating the object using a callback
 * function. The values of the object are preserved.
 */
export function rekeyObject<T extends Record<string, any>>(
  object: T,
  callback: (entry: [keyof T, T[keyof T]]) => string,
): { [key: string]: T[keyof T] } {
  return mutateObject(object, ([key, value]) => [
    callback([key, value]),
    value,
  ]);
}

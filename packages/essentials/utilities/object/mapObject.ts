/**
 * Maps each entry of an object to a new value using a callback function and
 * returns an array containing the new values.
 */
export function mapObject<T extends object, U>(
  object: T,
  callback: (entry: [keyof T, T[keyof T]], index: number) => U,
): U[] {
  return Object.entries(object).map((entry, index) =>
    callback(entry as [keyof T, T[keyof T]], index),
  );
}

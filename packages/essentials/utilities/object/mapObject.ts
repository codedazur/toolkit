/**
 * Maps each entry of an object to a new value using a callback function and
 * returns an array containing the new values.
 */
export function mapObject<T extends Record<string, any>, U>(
  object: T,
  callback: (entry: [keyof T, T[keyof T]], index: number) => U
): U[] {
  return Object.entries(object).map(callback);
}

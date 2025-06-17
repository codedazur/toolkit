/**
 * A utility type to merge a union of objects into a single object type.
 *
 * @template U The union of objects to merge.
 */
type MergeUnion<U> = (U extends unknown ? (k: U) => void : never) extends (
  k: infer I,
) => void
  ? { [K in keyof I]: I[K] }
  : never;

/**
 * A recursion limit for the default flatten operation. This is a safeguard to
 * prevent TypeScript from entering an infinite type instantiation loop, which
 * can cause performance issues.
 */
const defaultMaxDepth = 10;

/**
 * Recursively flattens an object's keys up to a specified maximum depth.
 *
 * @template T The object type to flatten.
 * @template MaxDepth The maximum depth to flatten to.
 * @template P The current prefix for flattened keys.
 * @template CurrentDepth The current recursion depth, which starts at 1.
 */
type FlattenWithDepth<
  T,
  MaxDepth extends number,
  P extends string = "",
  CurrentDepth extends unknown[] = [unknown],
> = {
  [K in Extract<keyof T, string | number>]: T[K] extends Record<
    string | number,
    unknown
  >
    ? // Check if we should recurse further
      CurrentDepth["length"] extends MaxDepth
      ? // If at max depth, stop and assign the object as the value
        { [key in `${P}${K}`]: T[K] }
      : // Otherwise, recurse deeper
        FlattenWithDepth<
          T[K],
          MaxDepth,
          `${P}${K}.`,
          [...CurrentDepth, unknown] // Increment depth counter
        >
    : // Not an object, it's a leaf node
      { [key in `${P}${K}`]: T[K] };
}[Extract<keyof T, string | number>];

/**
 * A utility type that takes a deeply nested object and returns a flattened
 * version. It can flatten to a default depth or a specified depth. It uses
 * `FlattenWithDepth` and `UnionToMergedObject` to create the final flat object
 * type.
 *
 * This type is distributive: if a union of object types is passed as `T`, it
 * will return a union of the flattened object types.
 *
 * @template T The object type to flatten. Can be a union of object types.
 * @template D The maximum depth to flatten to. If no value is provided, a
 *  default maximum depth of @see defaultMaxDepth is used to prevent infinite
 *  recursion.
 */
type Flatten<T, D extends number = typeof defaultMaxDepth> =
  T extends Record<string | number, unknown>
    ? MergeUnion<FlattenWithDepth<T, D>>
    : T;

/**
 * Flattens a nested object into a single-level object with dot-concatenated
 * keys up to a specified maximum depth.
 *
 * @param object The object to flatten.
 * @param options An object containing configuration options.
 * @returns A new object with flattened keys and their corresponding values.
 */
export function flattenObject<
  T extends Record<string | number, unknown>,
  D extends number,
>(object: T, options: { maxDepth: D }): Flatten<T, D>;

/**
 * Flattens a nested object into a single-level object with dot-concatenated
 * keys.
 *
 * @param object The object to flatten.
 * @param options An object containing configuration options.
 * @returns A new object with flattened keys and their corresponding values.
 */
export function flattenObject<T extends Record<string | number, unknown>>(
  object: T,
  options?: { maxDepth?: never },
): Flatten<T, typeof defaultMaxDepth>;

/**
 * Flattens a nested object into a single-level object with dot-concatenated
 * keys up to a specified maximum depth.
 *
 * @param object The object to flatten.
 * @param options An object containing configuration options.
 * @returns A new object with flattened keys and their corresponding values.
 */
export function flattenObject<T extends Record<string | number, unknown>>(
  object: T,
  options?: { maxDepth?: number },
): Record<string, unknown> {
  const maxDepth = options?.maxDepth ?? defaultMaxDepth;
  const flattened: Record<string, unknown> = {};

  function flatten(current: Record<string, unknown>, prefix = "", depth = 1) {
    for (const key in current) {
      if (Object.prototype.hasOwnProperty.call(current, key)) {
        const newKey = prefix ? `${prefix}.${key}` : key;
        const value = current[key];
        const isObject =
          typeof value === "object" && value !== null && !Array.isArray(value);

        /**
         * Stop recursing if the value is not an object or if we've reached the
         * specified max depth.
         */
        if (!isObject || depth >= maxDepth) {
          flattened[newKey] = value;
        } else {
          flatten(value as Record<string, unknown>, newKey, depth + 1);
        }
      }
    }
  }

  flatten(object);

  return flattened;
}

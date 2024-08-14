/**
 * Filters an object by its entries.
 */
export function filterObject<
  U extends Record<string, unknown>,
  T extends Record<string, unknown> = Record<string, unknown>,
  K extends keyof T = keyof T,
>(object: T, callback: (entry: [K, T[K]]) => boolean): U {
  return Object.fromEntries(
    (Object.entries(object) as [K, T[K]][]).filter(callback),
  ) as U;
}

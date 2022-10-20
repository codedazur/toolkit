export function pick<T extends object, K extends keyof T>(
  record: T,
  keys: K[]
): Pick<T, K> {
  return Object.fromEntries(
    Object.entries(record).filter(([key]) => keys.includes(key as K))
  ) as Pick<T, K>;
}

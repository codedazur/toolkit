export function omit<T extends object, K extends keyof T>(
  record: T,
  keys: K[]
): Omit<T, K> {
  return Object.fromEntries(
    Object.entries(record).filter(([key]) => !keys.includes(key as K))
  ) as Omit<T, K>;
}

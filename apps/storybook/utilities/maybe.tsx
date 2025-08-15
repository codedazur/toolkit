export function maybe<T>(value: T, chance = 0.5): T | undefined {
  return Math.random() < chance ? value : undefined;
}

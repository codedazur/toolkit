/**
 * Limits a value between to a certain minimum and maximum.
 *
 * @param value The value to clamp.
 * @param min The lowest allowed value.
 * @param max The highest allowed value.
 *
 * @example clamp(14, 3, 10) = 10
 */
export function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(value, max));
}

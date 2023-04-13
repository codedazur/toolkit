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
  if(min >= max) {
    throw new Error("The minimum value must be less than the maximum value.");
  } 
  return Math.max(min, Math.min(value, max));
}

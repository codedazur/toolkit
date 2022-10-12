/**
 * Converts radians into degrees.
 *
 * @param radians The value to convert into degrees.
 *
 * @example rad2deg(Math.PI) = 180
 */
export function rad2deg(radians: number): number {
  return radians * (180 / Math.PI);
}

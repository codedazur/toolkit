/**
 * Generates an array of sequential integers from start to end. Both
 * incrementing and decrementing sequences are supported.
 *
 * @param start The first number of the seuqnce.
 * @param end The last number of the sequence.
 *
 * @example sequence(3, 6) = [3, 4, 5, 6]
 * @example sequence(2, -2) = [2, 1, 0, -1, -2]
 */
export function sequence(start: number, end: number): number[] {
  return Array<number>(Math.abs(end - start) + 1)
    .fill(start)
    .map((start, index) => start + index * (end >= start ? 1 : -1));
}

/**
 * Performs a modulo operation, which differs from the native `%` operator
 * (which actually performs a _remainder_ operation rather than a modulo
 * operation) in that it always returns remainders in the sign of the divisor
 * rather than the sign of the dividend. To examplify, `-2 % 5` yields `-2`,
 * whereas `modulo(-2, 5)` yields `3`.
 *
 * @param dividend The value to mutate.
 * @param divisor The value to wrap the dividend around.
 *
 * @example modulo(2, 5) = 2
 * @example modulo(-2, 5) = 3
 */
export function modulo(dividend: number, divisor: number): number {
  return ((dividend % divisor) + divisor) % divisor;
}

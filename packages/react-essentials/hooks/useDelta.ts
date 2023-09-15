import { usePrevious } from "./usePrevious";
/**
 * Returns the difference between the previous and current values of a number
 * variable.
 *
 * See here for more details on delta https://brilliant.org/wiki/option-greeks-delta/
 *
 * @param value The variable to get the difference for.
 * @returns the difference between the current value and the previous value
 */
export function useDelta<T extends number>(value: T) {
  const previous = usePrevious(value);
  return previous !== undefined ? value - previous : 0;
}

import { usePrevious } from "./usePrevious";

/**
 * Returns the difference betweenn the previous and current values of a number
 * variable.
 *
 * @param value The variable to get the difference for.
 * @returns The difference between the previous and current value.
 */
export function useDelta<T extends number>(value: T) {
  const previous = usePrevious(value);
  return previous !== undefined ? value - previous : 0;
}

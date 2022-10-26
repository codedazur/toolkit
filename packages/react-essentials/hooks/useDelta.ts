import { usePrevious } from "./usePrevious";

export function useDelta<T extends number>(value: T) {
  const previous = usePrevious(value);
  return previous ? value - previous : 0;
}

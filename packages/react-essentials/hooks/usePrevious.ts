/**
 * Returns the previous value of a variable.
 *
 * @param value The variable to get the previous value of.
 * @returns The previous value of the variable.
 */
import { useEffect, useRef } from "react";

export function usePrevious<T>(value: T) {
  const ref = useRef<T>(undefined);

  useEffect(() => {
    ref.current = value;
  });

  return ref.current;
}

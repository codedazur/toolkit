/** 
 * usePrevious is a custom hook used to get the previous value of a variable.
 * @param {T} value - the variable to get the previous value of
 * @returns {T} - the previous value of the variable
 */

import { useEffect, useRef } from "react";

export function usePrevious<T>(value: T) {
  const ref = useRef<T>();

  useEffect(() => {
    ref.current = value;
  });

  return ref.current;
}

import { RefObject, useEffect, useRef } from "react";

/**
 * The `useSynchronizedRef` hook takes a variable and creates a reference to it
 * that it updates whenever a re-render occurs, without itself triggering a
 * re-render for this update.
 *
 * This is useful when you want to use a reactive variable in an effect without
 * triggering that effect when the value of this variable changes, because you
 * won't need to add the variable to the effect's dependency array.
 *
 * | Hook                 | Mutable? | Triggers re-renders? | Updates value? |
 * | -------------------- | -------- | -------------------- | -------------- |
 * | `useRef`             | Yes      | No                   | No             |
 * | `useState`           | Yes      | Yes                  | No             |
 * | `useSynchronizedRef` | Yes      | No                   | Yes            |
 *
 * @param value The variable to synchronize.
 * @returns A reference to the latest value of the variable.
 */

export function useSynchronizedRef<T>(value: T): RefObject<T> {
  const ref = useRef(value);

  useEffect(() => {
    ref.current = value;
  }, [value]);

  return ref;
}

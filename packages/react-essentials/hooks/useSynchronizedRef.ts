import { RefObject, useEffect, useRef } from "react";

/**
 * 
 * | Hook            | Mutable reference? | Re-renders on value change? | Synchronizes value changes? |
| ---------------| ------------------| ---------------------------| ---------------------------|
| `useRef`        | Yes               | No                         | No                         |
| `useState`      | Yes               | Yes                        | No                         |
| `useSynchronizedRef` | Yes           | No                         | Yes                        |

Comparison to useRef and useState
The useSynchronizedRef hook is similar to the useRef hook in that it allows you to 
create a mutable reference that persists across re-renders of a component. 
However, it also includes an useEffect hook that synchronizes the reference with a given value whenever that value changes.

 The main difference between useSynchronizedRef and useState is that
 useSynchronizedRef doesn't trigger a re-render when the value changes, while useState does. 
 When using useSynchronizedRef, you need to manually trigger a re-render by calling setState or by changing a prop passed to the component.
 * 
 * @param value it can be any value that useRef can hold 
 * @returns returns a ref object with a current property that is synchronized with the value passed in
 */

export function useSynchronizedRef<T>(value: T): RefObject<T> {
  const ref = useRef(value);

  useEffect(() => {
    ref.current = value;
  }, [value]);

  return ref;
}

import { RefObject, useEffect, useRef } from "react";

export function useSynchronizedRef<T>(value: T): RefObject<T> {
  const ref = useRef(value);

  useEffect(() => {
    ref.current = value;
  }, [value]);

  return ref;
}

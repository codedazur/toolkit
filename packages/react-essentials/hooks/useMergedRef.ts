import { Dispatch, ForwardedRef, SetStateAction, useCallback } from "react";

type Ref<T> = Dispatch<SetStateAction<T>> | ForwardedRef<T>;

export function useMergedRef<T = unknown>(...refs: Ref<T | null>[]) {
  // eslint-disable-next-line react-hooks/exhaustive-deps
  return useCallback(mergeRefs(...refs), refs);
}

export function mergeRefs<T = unknown>(...refs: Ref<T | null>[]) {
  return (value: T | null) => {
    refs.forEach((ref) => setRef(ref, value));
  };
}

function setRef<T = unknown>(ref: Ref<T | null>, value: T | null) {
  if (typeof ref === "function") {
    ref(value);
  } else if (typeof ref === "object" && ref !== null && "current" in ref) {
    ref.current = value;
  }
}

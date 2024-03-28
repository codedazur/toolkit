import { MaybeRef } from "../types/MaybeRef";

export function resolveMaybeRef<T extends Element>(ref: MaybeRef<T>): T | null {
  if (
    typeof window !== "undefined" &&
    "Element" in window &&
    ref instanceof window.Element
  ) {
    return ref;
  } else if (
    ref &&
    typeof ref === "object" &&
    "current" in ref &&
    ref.current
  ) {
    return ref.current as T;
  }
  return null;
}

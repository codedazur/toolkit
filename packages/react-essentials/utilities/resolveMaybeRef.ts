import { MaybeRef } from "../types/MaybeRef";

export function resolveMaybeRef<T extends HTMLElement>(
  ref: MaybeRef<T>,
): T | null {
  if (
    typeof window !== "undefined" &&
    "HTMLElement" in window &&
    ref instanceof window.HTMLElement
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

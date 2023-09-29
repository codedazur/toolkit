import { MaybeRef } from "../types/MaybeRef";

export function resolveMaybeRef<T extends HTMLElement>(
  ref: MaybeRef<T>,
): T | null {
  return ref instanceof HTMLElement ? ref : ref?.current ?? null;
}

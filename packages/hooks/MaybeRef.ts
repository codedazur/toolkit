import { RefObject } from "react";

export type MaybeRef<T extends HTMLElement> = RefObject<T> | T | null;

export function resolveMaybeRef<T extends HTMLElement>(
  ref: MaybeRef<T>
): T | null {
  return ref instanceof HTMLElement ? ref : ref?.current ?? null;
}

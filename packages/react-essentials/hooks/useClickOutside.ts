import { useLayoutEffect } from "react";
import { MaybeRef } from "../types/MaybeRef";
import { resolveMaybeRef } from "../utilities/resolveMaybeRef";

export function useClickOutside<T extends HTMLElement>({
  ref,
  callback,
}: {
  ref: MaybeRef<T>;
  callback: () => void;
}) {
  useLayoutEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const element = resolveMaybeRef(ref);

      if (element && (event.target as Node | null)?.contains(element)) {
        callback();
      }
    };

    window.setTimeout(() => {
      window.document.addEventListener("click", handleClickOutside);
    }, 0);

    return () => {
      window.document.removeEventListener("click", handleClickOutside);
    };
  }, [ref, callback]);
}

import { useEffect, useMemo, useState } from "react";
import { MaybeRef } from "../types/MaybeRef";
import { resolveMaybeRef } from "../utilities/resolveMaybeRef";

interface Size {
  width: number;
  height: number;
}

export const useSize = <T extends HTMLElement>(
  ref: MaybeRef<T>,
  { box }: ResizeObserverOptions = {},
): Size | null => {
  const [entry, setEntry] = useState<ResizeObserverEntry | null>(null);

  useEffect(() => {
    const element = resolveMaybeRef(ref);

    if (element !== null && "ResizeObserver" in window) {
      const handler = (entries: ResizeObserverEntry[]) => {
        setEntry(entries[0] ?? null);
      };

      const observer = new ResizeObserver(handler);
      observer.observe(element, { box });

      return () => {
        setEntry(null);
        observer.disconnect();
      };
    }

    setEntry(null);
  }, [ref, box]);

  return useMemo(
    () =>
      entry
        ? {
            width: entry.contentRect.width,
            height: entry.contentRect.height,
          }
        : null,
    [entry],
  );
};

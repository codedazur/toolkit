import { Rectangle } from "@codedazur/essentials";
import { useEffect, useMemo, useState } from "react";
import { MaybeRef } from "../types/MaybeRef";
import { resolveMaybeRef } from "../utilities/resolveMaybeRef";

/**
 * Use this hook to check for intersections with the viewport or a different
 * root element. The return value contains information on the intersection.
 *
 * @see useIsIntersecting If you just need a boolean to check whether the
 * referenced element is intersecting or not.
 */
export const useIntersection = <T extends Element>(
  ref: MaybeRef<T>,
  options: IntersectionObserverInit = {},
): {
  time: number;
  isIntersecting: boolean;
  overlap: number;
  rectangles: {
    intersection: Rectangle | null;
    target: Rectangle;
    root: Rectangle | null;
  };
} | null => {
  const [entry, setEntry] = useState<IntersectionObserverEntry | null>(null);

  useEffect(() => {
    const element = resolveMaybeRef(ref);

    if (element !== null && "IntersectionObserver" in window) {
      const handler = (entries: IntersectionObserverEntry[]) => {
        setEntry(entries[0] ?? null);
      };

      const observer = new IntersectionObserver(handler, {
        root: options.root,
        rootMargin: options.rootMargin,
        threshold: options.threshold,
      });

      observer.observe(element);

      return () => {
        setEntry(null);
        observer.disconnect();
      };
    }
    setEntry(null);
  }, [ref, options.root, options.rootMargin, options.threshold]);

  return useMemo(
    () =>
      entry
        ? {
            time: entry.time,
            isIntersecting: entry.isIntersecting,
            overlap: entry.intersectionRatio,
            rectangles: {
              intersection: entry.isIntersecting
                ? Rectangle.fromDOMRect(entry.intersectionRect)
                : null,
              target: Rectangle.fromDOMRect(entry.boundingClientRect),
              root: entry.rootBounds
                ? Rectangle.fromDOMRect(entry.rootBounds)
                : null,
            },
          }
        : null,
    [entry],
  );
};

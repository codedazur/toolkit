import { useMemo } from "react";
import { MaybeRef } from "../types/MaybeRef";
import { useIntersection } from "./useIntersection";

const defaultOptions = {};

/**
 * Use this hook for checking for intersections with viewport or a passed custom
 * root element. The returned ref can be passed to any HTMLElement.
 *
 * @see {@link useIntersection} when you need more details on the intersection
 * than just the `isIntersecting` boolean.
 */
export const useIsIntersecting = <T extends HTMLElement>(
  ref: MaybeRef<T>,
  options: IntersectionObserverInit = defaultOptions,
): boolean | undefined => {
  const entry = useIntersection<T>(ref, options);

  return useMemo(() => entry?.isIntersecting, [entry]);
};

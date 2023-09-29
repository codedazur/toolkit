import { Vector2 } from "@codedazur/essentials";
import {
  MaybeRef,
  ScrollState,
  resolveMaybeRef,
  useScroll,
} from "@codedazur/react-essentials";
import { RefObject, useCallback, useRef } from "react";

export interface UseParallaxProps {
  scrollRef?: MaybeRef<HTMLElement>;
  factor: ParallaxFactor;
}

export type ParallaxFactor = number | ((position: Vector2) => Vector2);

/**
 * Creates a ref that can be used to apply a parallax effect to an element.
 * @param factor The factor of the parallax effect. A number between -1 and 1.
 * @param scrollRef The scrollable element. Defaults to the window.
 * @returns A ref to the element.
 * @example
 * const ref = useParallax<HTMLDivElement>({
 *   factor: 0.5,
 * });
 *
 * return <div ref={ref} />
 */
export function useParallax<T extends HTMLElement>({
  factor,
  scrollRef,
}: UseParallaxProps): RefObject<T> {
  const ref = useRef<T>(null);

  const handleScroll = useCallback(
    ({ position }: ScrollState) => {
      const target = resolveMaybeRef(ref);

      if (!target) {
        return;
      }

      const translated = translate(position, factor);

      window.requestAnimationFrame(() => {
        target.style.transform = `translateX(${translated.x}px) translateY(${translated.y}px)`;
      });
    },
    [ref, factor],
  );

  useScroll({
    ref: scrollRef,
    onScroll: handleScroll,
  });

  return ref;
}

function translate(position: Vector2, factor: ParallaxFactor): Vector2 {
  return factor instanceof Function
    ? factor(position)
    : position.multiply(1 - factor);
}

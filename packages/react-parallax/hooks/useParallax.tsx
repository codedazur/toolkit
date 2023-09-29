import { Vector2 } from "@codedazur/essentials";
import {
  MaybeRef,
  ScrollState,
  resolveMaybeRef,
  useScroll,
} from "@codedazur/react-essentials";
import { RefObject, useCallback, useRef, useState } from "react";

interface UseParallaxProps {
  scrollRef?: MaybeRef<HTMLElement>;
  factor: ParallaxFactor;
}

export type ParallaxFactor = number | ((position: Vector2) => Vector2);

export function useParallax<T extends HTMLElement>(parameters: {
  scrollRef?: MaybeRef<HTMLElement>;
  factor: ParallaxFactor;
}): RefObject<T>;

// export function useParallax(parameters: {
//   scrollRef?: MaybeRef<HTMLElement>;
//   factor: ParallaxFactor[];
// });

/**
 * @todo Investigate if we can implement a pure CSS approach to resolve the
 * performance issues. We should do this before the other todo's, because the
 * outcome might affect the other tasks.
 *
 * @todo Improve the performance of this hook by preventing the need to re-
 * render on every scroll event. We could use Framer Motion's `MotionValue` for
 * this, but in order to avoid a dependency, we might be able to implement
 * something similar ourselves using refs.
 *
 * @todo Option: Support just a single layer instead of an entire array, so that
 * it is easier to move the hook down in the render tree to improve performance.
 * This is only relevant if we cannot implement a way to avoid re-rendering on
 * every scroll event.
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

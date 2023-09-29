import { Vector2 } from "@codedazur/essentials";
import { MaybeRef, ScrollState, useScroll } from "@codedazur/react-essentials";
import { useCallback, useState } from "react";

interface UseParallaxProps {
  scrollRef?: MaybeRef<HTMLElement>;
  factor: ParallaxFactor | ParallaxFactor[];
}

export type ParallaxFactor = number | ((position: Vector2) => Vector2);

export function useParallax(parameters: {
  scrollRef?: MaybeRef<HTMLElement>;
  factor: ParallaxFactor;
}): Vector2;

export function useParallax(parameters: {
  scrollRef?: MaybeRef<HTMLElement>;
  factor: ParallaxFactor[];
}): Vector2[];

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
export function useParallax({
  scrollRef,
  factor,
}: UseParallaxProps): Vector2 | Vector2[] {
  const [translation, setTranslation] = useState<Vector2 | Vector2[]>(
    Array.isArray(factor) ? factor.map(() => Vector2.zero) : Vector2.zero,
  );

  const handleScroll = useCallback(
    ({ position }: ScrollState) => {
      setTranslation(
        Array.isArray(factor)
          ? factor.map((factor) => translate(position, factor))
          : translate(position, factor),
      );
    },
    [factor],
  );

  useScroll({
    ref: scrollRef,
    onScroll: handleScroll,
  });

  return translation;
}

function translate(position: Vector2, factor: ParallaxFactor): Vector2 {
  return factor instanceof Function
    ? factor(position)
    : position.multiply(1 - factor);
}

import { Vector2 } from "@codedazur/essentials";
import { MaybeRef, useScroll } from "@codedazur/react-essentials";

interface Layer {
  factor: number;
  translation: Vector2;
}

export function useParallax(parameters: {
  scrollRef?: MaybeRef<HTMLElement>;
  factor: number;
}): Layer;

export function useParallax(parameters: {
  scrollRef?: MaybeRef<HTMLElement>;
  factor: number[];
}): Layer[];

/**
 * @todo Investigate if we can implement a pure CSS approach to resolve the
 * performance issues. We should do this before the other todo's, because the
 * outcome might affect the other tasks.
 *
 * @todo Change the return value to directly return the translation, since the
 * factor is not relevant as output.
 *
 * @todo Implement non-linear translation using a translation function.
 * ```
 * const translation = useParallax({
 *   factor: ({ y }) => y * y,
 * })
 * ```
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
}: {
  scrollRef?: MaybeRef<HTMLElement>;
  factor: number | number[];
}): Layer | Layer[] {
  const { position } = useScroll(scrollRef);

  if (Array.isArray(factor)) {
    return factor.map((factor) => layer(factor, position));
  } else {
    return layer(factor, position);
  }
}

function layer(factor: number, position: Vector2): Layer {
  return {
    factor,
    translation: position.multiply(1 - factor),
  };
}

import { Direction, Vector2 } from "@codedazur/essentials";
import {
  MaybeRef,
  ScrollState,
  resolveMaybeRef,
  useScroll,
} from "@codedazur/react-essentials";
import { RefObject, useCallback, useEffect, useRef } from "react";

interface BaseUseParallaxProps {
  scrollRef?: MaybeRef<HTMLElement>;
  factor: ParallaxFactor;
  cover?: boolean;
}

interface CoverUseParallaxProps extends BaseUseParallaxProps {
  factor: PrimitiveParallaxFactor;
  cover?: boolean;
}

interface CustomUseParallaxProps extends BaseUseParallaxProps {
  factor: ParallaxFactorFunction;
  cover?: false;
}

export type UseParallaxProps = CoverUseParallaxProps | CustomUseParallaxProps;

type PrimitiveParallaxFactor = number | Vector2;

type ParallaxFactorFunction = (position: Vector2) => Vector2;

type ParallaxFactor = PrimitiveParallaxFactor | ParallaxFactorFunction;

/**
 * Creates a ref that can be used to apply a parallax effect to an element.
 *
 * @param factor The factor of the parallax effect. A number between -1 and 1.
 * @param scrollRef The scrollable element. Defaults to the window.
 * @returns A ref to the element.
 *
 * @example
 * const ref = useParallax<HTMLDivElement>({
 *   factor: 0.5,
 * });
 *
 * return <div ref={ref} />
 *
 * @todo A bug currently causes the element to jump on the first scroll event
 * when `cover` is set to true, because the initial position is not calculated.
 * This can be fixed by calling the `onScroll` callback of the `useScroll` hook
 * on the initial render to set the initial position.
 */
export function useParallax<T extends HTMLElement>({
  scrollRef,
  factor,
  cover = false,
}: UseParallaxProps): RefObject<T> {
  const ref = useRef<T>(null);

  const position = useRef<Vector2>(Vector2.zero);
  const offset = useRef<Vector2>(Vector2.zero);
  const windowSize = useRef<Vector2>(Vector2.zero);
  const elementSize = useRef<Vector2>(Vector2.zero);

  const translation = useRef<Vector2>(Vector2.zero);
  const scale = useRef<number>(1);

  const applyTransform = useCallback(() => {
    const target = resolveMaybeRef(ref);

    if (!target) {
      return;
    }

    window.requestAnimationFrame(() => {
      target.style.transform = `translate3d(${translation.current.x}px, ${translation.current.y}px, 0) scale(${scale.current})`;
    });
  }, []);

  const handleScroll = useCallback(
    (state: ScrollState) => {
      position.current = state.position;

      if (cover === true && ref.current) {
        const scrollOffset = getOffset(ref.current).subtract(
          translation.current,
        );

        offset.current = scrollOffset
          .subtract(windowSize.current.divide(2))
          .add(elementSize.current.divide(2))
          .multiply(Vector2.one.subtract(factor as PrimitiveParallaxFactor))
          /**
           * @todo Make this configurable in case the scroll direction is
           * different, or determine it based on the state.overflow.
           */
          .multiply(Direction.up);
      }

      translation.current = translate(position.current, factor).add(
        offset.current,
      );

      applyTransform();
    },
    [applyTransform, cover, factor],
  );

  useScroll({
    ref: scrollRef,
    onScroll: handleScroll,
  });

  const setScale = useCallback(() => {
    if (!cover) {
      return;
    }

    scale.current = Math.max(
      windowSize.current.x / elementSize.current.x,
      windowSize.current.y / elementSize.current.y,
    );

    applyTransform();
  }, [applyTransform, cover]);

  useSize({
    ref,
    onResize: (size) => {
      elementSize.current = size;
      setScale();
    },
  });

  useWindowSize({
    onResize: (size) => {
      windowSize.current = size;
      setScale();
    },
  });

  return ref;
}

/**
 * This function returns the offset of an element relative to the document.
 * @todo Check if there is a simpler way to do this.
 */
function getOffset(element: HTMLElement) {
  const rectangle = element.getBoundingClientRect();

  const scrollX = document.documentElement.scrollLeft;
  const scrollY = document.documentElement.scrollTop;

  const clientX = document.documentElement.clientLeft || 0;
  const clientY = document.documentElement.clientTop || 0;

  const x = rectangle.x + scrollX - clientX;
  const y = rectangle.y + scrollY - clientY;

  return new Vector2(Math.round(x), Math.round(y));
}

function translate(position: Vector2, factor: ParallaxFactor): Vector2 {
  return factor instanceof Function
    ? factor(position)
    : position.multiply(Vector2.one.subtract(factor));
}

/**
 * A hook that uses a resize observer to call a callback whenever the element
 * resizes. if no particular ref is provided, it will use the window.
 * @todo Release this as part of the @codedazur/react-essentials package.
 */
function useSize<T extends HTMLElement>({
  ref,
  onResize,
}: {
  ref?: MaybeRef<T>;
  onResize: (size: Vector2) => void;
}): void {
  const observer = useRef<ResizeObserver | null>(null);

  const handleResize = useCallback(
    (entries: ResizeObserverEntry[]) => {
      if (entries.length > 0) {
        const { width, height } = entries[0].contentRect;
        onResize(new Vector2(width, height));
      }
    },
    [onResize],
  );

  useEffect(() => {
    const target = resolveMaybeRef(ref ?? document.body);

    if (!target) {
      return;
    }

    observer.current = new ResizeObserver(handleResize);
    observer.current.observe(target);

    return () => {
      if (observer.current) {
        observer.current.disconnect();
      }
    };
  }, [handleResize, ref]);

  /**
   * Since the ResizeObserver only fires when the size changes, we need to
   * manually call the callback once to initialize the size.
   */
  useEffect(() => {
    const target = resolveMaybeRef(ref ?? document.body);

    if (!target) {
      return;
    }

    const { width, height } = target.getBoundingClientRect();

    onResize(new Vector2(width, height));
  }, [onResize, ref]);
}

/**
 * This function uses window.addEventListener('resize', ...) to call a callback
 * whenever the window resizes.
 * @todo Release this as part of the @codedazur/react-essentials package.
 */
function useWindowSize({
  onResize,
}: {
  onResize: (size: Vector2) => void;
}): void {
  const handleResize = useCallback(() => {
    onResize(new Vector2(window.innerWidth, window.innerHeight));
  }, [onResize]);

  useEffect(() => {
    handleResize();

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, [handleResize]);
}

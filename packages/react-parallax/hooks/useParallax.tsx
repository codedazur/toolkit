import { Direction, Vector2, lerp } from "@codedazur/essentials";
import {
  MaybeRef,
  ScrollState,
  resolveMaybeRef,
  useScroll,
} from "@codedazur/react-essentials";
import { useCallback, useEffect, useRef } from "react";

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
 * @todo If you use this hook with `cover: true`, it causes a repaint on every
 * scroll event. We should check if there is a more efficient way to calculate
 * the offset. I suspect it should be possible to use the transform origin in
 * such a way that that it doesn't need to change on scroll at all. I believe
 * it might be something close to this, though I think the `factor` should be a
 * factor as well somehow:
 *   - `50% ${elementHeight * (elementHeight / windowHeight) * index}px`
 */
export function useParallax<T extends HTMLElement>({
  scrollRef,
  factor,
  cover = false,
}: UseParallaxProps) {
  const ref = useRef<T>(null);

  const position = useRef<Vector2>(Vector2.zero);
  const windowSize = useRef<Vector2>(Vector2.zero);
  const elementSize = useRef<Vector2>(Vector2.zero);

  // const origin = useRef<Vector2>(Origin.center);
  const translation = useRef<Vector2>(Vector2.zero);
  const scale = useRef<number>(1);

  const setOffset = useCallback(() => {
    if (!ref.current) {
      return;
    }

    const scrollOffset = getOffset(ref.current);

    const offset = scrollOffset
      .subtract(windowSize.current.divide(2))
      .add(elementSize.current.divide(2))
      .multiply(Vector2.one.subtract(factor as PrimitiveParallaxFactor))
      /**
       * @todo Make this configurable in case the scroll direction is
       * different, or determine it based on the state.overflow.
       */
      .multiply(Direction.up);

    translation.current = translation.current.add(offset);
  }, [factor]);

  // const setOrigin = useCallback(() => {
  //   if (!ref.current || !cover) {
  //     return;
  //   }

  //   console.log(ref.current.parentElement);

  //   const offset = getOffset(ref.current.parentElement!);

  //   origin.current = new Vector2(
  //     windowSize.current.x / 2 - offset.x,
  //     windowSize.current.y / 2 - offset.y,
  //   );
  // }, [ref, translation, windowSize, elementSize, factor, cover]);

  const setTranslation = useCallback(() => {
    translation.current = translate(position.current, factor);

    if (cover) {
      setOffset();
    }
  }, [cover, factor, setOffset]);

  const setScale = useCallback(() => {
    if (!cover) {
      return;
    }

    scale.current = lerp(
      Math.max(
        windowSize.current.x / elementSize.current.x,
        windowSize.current.y / elementSize.current.y,
      ),
      1,
      typeof factor === "number" ? factor : (factor as Vector2).magnitude,
    );
  }, [cover, factor]);

  const applyTransform = useCallback(() => {
    const target = resolveMaybeRef(ref);

    if (!target) {
      return;
    }

    window.requestAnimationFrame(() => {
      // target.style.transformOrigin = [
      //   `${origin.current.x * 100}%`,
      //   `${origin.current.y * 100}%`,
      // ].join(" ");

      target.style.transform = [
        `translate3d(${[
          `${translation.current.x}px`,
          `${translation.current.y}px`,
          0,
        ].join(", ")})`,
        `scale(${scale.current})`,
      ].join(" ");
    });
  }, []);

  const updateTransform = useCallback(() => {
    // setOrigin();
    setTranslation();
    setScale();

    applyTransform();
  }, [applyTransform, setScale, setTranslation]);

  const handleScroll = useCallback(
    (state: ScrollState) => {
      position.current = state.position;
      updateTransform();
    },
    [updateTransform],
  );

  const handleElementResize = useCallback(
    (size: Vector2) => {
      elementSize.current = size;
      updateTransform();
    },
    [updateTransform],
  );

  const handleWindowResize = useCallback(
    (size: Vector2) => {
      windowSize.current = size;
      updateTransform();
    },
    [updateTransform],
  );

  useScroll({
    ref: scrollRef,
    onScroll: handleScroll,
  });

  useSize({
    ref,
    onResize: handleElementResize,
  });

  useWindowSize({
    onResize: handleWindowResize,
  });

  return ref;
}

/**
 * This function returns the offset of an element relative to the document.
 * @todo This causes a repaint and is used on scroll. Check if there is a more
 * efficient way to do this.
 */
function getOffset(element: HTMLElement) {
  const rectangle = element.parentElement!.getBoundingClientRect();

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
 * resizes. If no particular ref is provided, it will use the window.
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

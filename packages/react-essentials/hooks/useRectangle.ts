import { Rectangle } from "@codedazur/essentials";
import { useCallback, useEffect, useMemo, useState } from "react";
import { MaybeRef } from "../types/MaybeRef";
import { resolveMaybeRef } from "../utilities/resolveMaybeRef";
import { useSynchronizedRef } from "./useSynchronizedRef";

/**
 * @todo Check if we can use bit flags instead of an object of booleans.
 */
export interface RectangleUpdateOptions {
  scroll?: boolean;
  windowResize?: boolean;
  elementResize?: boolean;
  animationFrame?: boolean;
}

const listeningPresets: Record<
  "default" | "disabled" | "animationFrame",
  RectangleUpdateOptions
> = {
  default: {
    scroll: true,
    windowResize: true,
    elementResize: true,
    animationFrame: false,
  },
  disabled: {
    scroll: false,
    windowResize: false,
    elementResize: false,
    animationFrame: false,
  },
  animationFrame: {
    scroll: false,
    windowResize: false,
    elementResize: false,
    animationFrame: true,
  },
};

/**
 * Measures the DOM rectangle of the provided element. Optionally keeps on
 * measuring on document scroll, window resize, element resize or even on
 * animation frame.
 *
 * If you only need the width and the height of an element, please take a look
 * at the @see useSize hook instead, or otherwise disable all listeners except
 * `elementSize` for maximum efficiency.
 *
 * @todo Find a way to support destructuring for the case where no rectangle is
 * determined. Currently we return `undefined`, which cannot be destructured.
 * However, returning `{}` or `new Rectangle(0, 0, 0|1, 0|1)` doesn't seem ideal
 * either.
 */
export function useRectangle(
  ref: MaybeRef<HTMLElement>,
  listen: boolean | RectangleUpdateOptions = listeningPresets.default,
): Rectangle | undefined {
  const [rectangle, setRectangle] = useState<Rectangle>();
  const rectangleRef = useSynchronizedRef(rectangle);

  const listeningOptions = useMemo(() => {
    switch (true) {
      case typeof listen === "object":
        return (listen as RectangleUpdateOptions).animationFrame
          ? listeningPresets.animationFrame
          : (listen as RectangleUpdateOptions);
      case listen === false:
        return listeningPresets.disabled;
      default:
      case listen === true:
        return listeningPresets.default;
    }
  }, [listen]);
  const listeningOptionsRef = useSynchronizedRef(listeningOptions);

  const measure = useCallback(() => {
    const element = resolveMaybeRef(ref);
    if (!element) return;

    const measurement = Rectangle.fromDOMRect(element.getBoundingClientRect());

    if (!rectangleRef.current?.equals(measurement)) {
      setRectangle(measurement);
    }
  }, [rectangleRef, ref]);

  const throttledMeasure = useCallback(() => {
    window.requestAnimationFrame(measure);
  }, [measure]);

  // Initial measurement.
  useEffect(measure, [measure]);

  // Measure on scroll.
  useEffect(() => {
    listeningOptions.scroll &&
      document.addEventListener("scroll", throttledMeasure, true);

    return () => {
      listeningOptions.scroll &&
        document.removeEventListener("scroll", throttledMeasure, true);
    };
  }, [throttledMeasure, listeningOptions]);

  // Measure on window resize.
  useEffect(() => {
    listeningOptions.windowResize &&
      window.addEventListener("resize", throttledMeasure);

    return () => {
      listeningOptions.windowResize &&
        window.removeEventListener("resize", throttledMeasure);
    };
  }, [throttledMeasure, listeningOptions]);

  // Measure on element resize.
  useEffect(() => {
    if (!listeningOptions.elementResize) return;

    const element = resolveMaybeRef(ref);
    if (!element || !("ResizeObserver" in window)) return;

    const observer = new ResizeObserver(measure);
    observer.observe(element);

    return () => observer.disconnect();
  }, [ref, listeningOptions, measure]);

  // Measure on animation frame.
  useEffect(() => {
    if (!listeningOptions.animationFrame) return;

    const element = resolveMaybeRef(ref);
    if (!element) return;

    const loop = () => {
      window.requestAnimationFrame(() => {
        measure();

        if (listeningOptionsRef.current?.animationFrame) {
          loop();
        }
      });
    };

    loop();
  }, [ref, listeningOptions, listeningOptionsRef, measure]);

  return rectangle;
}

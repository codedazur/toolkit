import { useMotionValue } from "framer-motion";
import { useCallback, useEffect, useState } from "react";
import { MaybeRef } from "../types/MaybeRef";
import { resolveMaybeRef } from "../utilities/resolveMaybeRef";

type CursorContext = "viewport" | "document" | "parent";

/**
 * @todo Add an `origin: Origin` prop, so that it is easy to get, for example,
 * centered coordinates.
 * @todo Add a `normalize: boolean` prop, so that it is easy to get coordinates
 * between (-1|0) and 1.
 */
export function useCursor({
  ref,
  context = "viewport",
}: {
  ref?: MaybeRef<HTMLElement>;
  context?: CursorContext;
} = {}) {
  const [hover, setHover] = useState(false);
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  useEffect(() => {
    const element = ref ? resolveMaybeRef(ref) : window.document;

    const handleMouseEnter = () => setHover(true);
    const handleMouseLeave = () => setHover(false);

    const handleMouseMove = (event: MouseEvent) => {
      switch (context) {
        case "viewport":
          x.set(event.clientX);
          y.set(event.clientY);
          break;
        case "document":
          x.set(event.pageX);
          y.set(event.pageY);
          break;
        case "parent":
          x.set(event.offsetX);
          y.set(event.offsetY);
          break;
      }
    };

    element?.addEventListener("mouseenter", handleMouseEnter);
    element?.addEventListener("mouseleave", handleMouseLeave);
    element?.addEventListener("mousemove", handleMouseMove as EventListener);

    return () => {
      element?.removeEventListener("mouseenter", handleMouseEnter);
      element?.removeEventListener("mouseleave", handleMouseLeave);
      element?.removeEventListener(
        "mousemove",
        handleMouseMove as EventListener,
      );
    };
  }, [ref, context, x, y]);

  const usePosition = useCallback(
    function usePosition() {
      const [reactiveX, setReactiveX] = useState(0);
      const [reactiveY, setReactiveY] = useState(0);

      useEffect(() => {
        x.onChange(setReactiveX);
        y.onChange(setReactiveY);
        // eslint-disable-next-line react-hooks/exhaustive-deps
      }, [x, y]);

      return {
        x: reactiveX,
        y: reactiveY,
      };
    },
    [x, y],
  );

  return {
    hover,
    position: { x, y },
    usePosition,
  };
}

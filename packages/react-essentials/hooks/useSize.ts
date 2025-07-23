import { useEffect, useState } from "react";
import { MaybeRef } from "../types/MaybeRef";
import { resolveMaybeRef } from "../utilities/resolveMaybeRef";

interface Size {
  width: number | undefined;
  height: number | undefined;
}

/**
 * @todo Make the Size type's width and height properties non-optional, and
 * instead, make the entire return type of this hook optional. This better
 * reflects the fact that the width and height are always present together if
 * they are present at all, and it also simplifies null-checks (albeit at the
 * cost of complicating destructuring).
 * @todo Either include the scroll size in this hook, or create a separate hook
 * for it.
 * @todo Compare this implementation with the private hook of the same name
 * defined in `@codedazur/react-parallax/hooks/useParallax.ts` and pick the one
 * that's best.
 */
export const useSize = <T extends Element>({
  ref,
  options,
}: { ref?: MaybeRef<T>; options?: ResizeObserverOptions } = {}): Size => {
  const [size, setSize] = useState<Size>({
    width: undefined,
    height: undefined,
  });

  useEffect(() => {
    if (ref) {
      return;
    }

    function handleResize() {
      setSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    }

    handleResize();

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, [ref]);

  useEffect(() => {
    if (!ref) {
      return;
    }

    const element = resolveMaybeRef(ref);

    if (element === null) {
      return;
    }

    setSize({
      width: element.clientWidth,
      height: element.clientHeight,
    });

    const handler = (entries: ResizeObserverEntry[]) => {
      setSize({
        width: entries[0]?.contentRect.width,
        height: entries[0]?.contentRect.height,
      });
    };

    const observer = new ResizeObserver(handler);
    observer.observe(element, options);

    return () => {
      observer.disconnect();
    };
  }, [ref, options]);

  return size;
};

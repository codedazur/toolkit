import { useEffect, useState } from "react";
import { MaybeRef } from "../types/MaybeRef";
import { resolveMaybeRef } from "../utilities/resolveMaybeRef";

interface Size {
  width: number | undefined;
  height: number | undefined;
}

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

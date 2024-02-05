import { useEffect, useMemo, useState } from "react";
import { MaybeRef } from "../types/MaybeRef";
import { resolveMaybeRef } from "../utilities/resolveMaybeRef";

interface Size {
  width: number | undefined;
  height: number | undefined;
}

export const useSize = <T extends HTMLElement>({
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

    console.log("add window event listener");
    window.addEventListener("resize", handleResize);

    return () => {
      console.log("remove window event listener");
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
    console.log("connect observer");
    observer.observe(element, options);

    return () => {
      console.log("disconnect observer");
      observer.disconnect();
    };
  }, [ref, options]);

  return size;
};

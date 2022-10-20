import { Vector2 } from "@codedazur/essentials";
import { useCallback, useEffect, useState } from "react";
import { MaybeRef } from "../types/MaybeRef";
import { resolveMaybeRef } from "../utilities/resolveMaybeRef";

interface ScrollState {
  position: Vector2;
  overflow: Vector2;
  progress: Vector2;
}

export function useScroll<T extends HTMLElement>(
  ref?: MaybeRef<T>
): ScrollState & {
  setPosition: (position: Vector2) => void;
  setProgress: (progress: Vector2) => void;
  addPosition: (position: Vector2) => void;
  addProgress: (progress: Vector2) => void;
} {
  const [state, setState] = useState<ScrollState>({
    position: Vector2.zero,
    overflow: Vector2.zero,
    progress: Vector2.zero,
  });

  useEffect(() => {
    const target = ref
      ? resolveMaybeRef(ref) ?? window.document
      : window.document;

    const onScroll = () => {
      const element =
        target instanceof Document ? window.document.documentElement : target;

      const position = new Vector2(
        Math.round(element.scrollLeft),
        Math.round(element.scrollTop)
      );

      const overflow = new Vector2(
        element.scrollWidth - element.clientWidth,
        element.scrollHeight - element.clientHeight
      );

      const progress = new Vector2(
        position.x / overflow.x || 0,
        position.y / overflow.y || 0
      );

      setState({
        position,
        overflow,
        progress,
      });
    };

    onScroll();

    target.addEventListener("scroll", onScroll);
    window.addEventListener("resize", onScroll);

    return () => {
      target.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [ref]);

  const setPosition = useCallback(
    (position: Vector2) => {
      const element = ref
        ? resolveMaybeRef(ref) ?? window.document.documentElement
        : window.document.documentElement;

      element.scrollTo({ left: position.x, top: position.y });
    },
    [ref]
  );

  const setProgress = useCallback(
    (progress: Vector2) => {
      const element = ref
        ? resolveMaybeRef(ref) ?? window.document.documentElement
        : window.document.documentElement;

      element.scrollTo({
        left: progress.x * (element.scrollWidth - element.clientWidth),
        top: progress.y * (element.scrollHeight - element.clientHeight),
      });
    },
    [ref]
  );

  const addPosition = useCallback(
    (addition: Vector2) => {
      const element = ref
        ? resolveMaybeRef(ref) ?? window.document.documentElement
        : window.document.documentElement;

      element.scrollBy({
        left: addition.x,
        top: addition.y,
      });
    },
    [ref]
  );

  const addProgress = useCallback(
    (addition: Vector2) => {
      const element = ref
        ? resolveMaybeRef(ref) ?? window.document.documentElement
        : window.document.documentElement;

      element.scrollBy({
        left: addition.x * (element.scrollWidth - element.clientWidth),
        top: addition.y * (element.scrollHeight - element.clientHeight),
      });
    },
    [ref]
  );

  return {
    ...state,
    setPosition,
    setProgress,
    addPosition,
    addProgress,
  };
}

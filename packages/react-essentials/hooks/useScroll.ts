import { Vector2 } from "@codedazur/essentials";
import { useCallback, useEffect, useState } from "react";
import { MaybeRef } from "../types/MaybeRef";
import { resolveMaybeRef } from "../utilities/resolveMaybeRef";

export interface ScrollState {
  position: Vector2;
  overflow: Vector2;
  progress: Vector2;
}

export function useScroll<T extends HTMLElement>({
  ref,
  onScroll,
}: {
  ref?: MaybeRef<T>;
  onScroll?: (state: ScrollState) => void;
} = {}): {
  setPosition: (position: Vector2) => void;
  setProgress: (progress: Vector2) => void;
  addPosition: (position: Vector2) => void;
  addProgress: (progress: Vector2) => void;
  useProgress: () => ScrollState;
} {
  useEffect(() => {
    const target = ref
      ? resolveMaybeRef(ref) ?? window.document
      : window.document;

    const handleScroll = () => {
      const state = getState(target);
      onScroll?.(state);
    };

    handleScroll();

    target.addEventListener("scroll", handleScroll);
    window.addEventListener("resize", handleScroll);

    return () => {
      target.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleScroll);
    };
  }, [onScroll, ref]);

  const setPosition = useCallback(
    (position: Vector2) => {
      const element = ref
        ? resolveMaybeRef(ref) ?? window.document.documentElement
        : window.document.documentElement;

      element.scrollTo({ left: position.x, top: position.y });
    },
    [ref],
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
    [ref],
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
    [ref],
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
    [ref],
  );

  const useProgress = useCallback(
    function useProgress() {
      return useScrollProgress({ ref });
    },
    [ref],
  );

  return {
    setPosition,
    setProgress,
    addPosition,
    addProgress,
    useProgress,
  };
}

export function useScrollProgress({ ref }: { ref?: MaybeRef<HTMLElement> }) {
  const [state, setState] = useState<ScrollState>({
    position: Vector2.zero,
    overflow: Vector2.zero,
    progress: Vector2.zero,
  });

  const handleScroll = useCallback(setState, [setState]);

  useScroll({ ref, onScroll: handleScroll });

  return state;
}

function getState(target: Document | HTMLElement): ScrollState {
  const element =
    target instanceof Document ? window.document.documentElement : target;

  const position = new Vector2(
    Math.round(element.scrollLeft),
    Math.round(element.scrollTop),
  );

  const overflow = new Vector2(
    element.scrollWidth - element.clientWidth,
    element.scrollHeight - element.clientHeight,
  );

  const progress = new Vector2(
    position.x / overflow.x || 0,
    position.y / overflow.y || 0,
  );

  return { position, overflow, progress };
}

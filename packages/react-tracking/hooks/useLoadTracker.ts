import { MaybeRef, resolveMaybeRef } from "@codedazur/react-essentials";
import { SyntheticEvent, useEffect } from "react";
import { useTracker } from "./useTracker";

export function useLoadTracker(ref: MaybeRef<Element>) {
  const { trackLoad } = useTracker();

  useEffect(() => {
    const element = resolveMaybeRef(ref);

    if (!element) {
      return;
    }

    const handleLoad = (event: Event) =>
      trackLoad(event as unknown as SyntheticEvent<Element, Event>);

    element.addEventListener("load", handleLoad);

    return () => {
      element.removeEventListener("load", handleLoad);
    };
  }, [ref, trackLoad]);
}

import {
  MaybeRef,
  resolveMaybeRef,
  useIsIntersecting,
  usePrevious,
} from "@codedazur/react-essentials";
import { useEffect, useRef } from "react";
import { useTracker } from "./useTracker";

export function useIntersectionTracker(
  ref: MaybeRef<HTMLElement>,
  {
    threshold = 0.5,
    frequency = "once",
    trackEnter: shouldTrackEnter = true,
    trackExit: shouldTrackExit = false,
  }: {
    threshold?: number;
    frequency?: "once" | "always";
    trackEnter?: boolean;
    trackExit?: boolean;
  } = {},
) {
  const isIntersecting = useIsIntersecting(ref, { threshold });
  const wasIntersecting = usePrevious(isIntersecting);
  const hasTrackedEnter = useRef(false);
  const hasTrackedExit = useRef(false);
  const { trackEnter, trackExit } = useTracker();

  useEffect(() => {
    const element = resolveMaybeRef(ref);

    if (!element) {
      return;
    }

    if (wasIntersecting === undefined) {
      return;
    }

    if (
      isIntersecting &&
      shouldTrackEnter &&
      (frequency === "always" || hasTrackedEnter.current === false)
    ) {
      trackEnter(element);
      hasTrackedEnter.current = true;
    } else if (
      !isIntersecting &&
      shouldTrackExit &&
      (frequency === "always" || hasTrackedExit.current === false)
    ) {
      trackExit(element);
      hasTrackedExit.current = true;
    }
  }, [
    frequency,
    hasTrackedEnter,
    hasTrackedExit,
    isIntersecting,
    ref,
    shouldTrackEnter,
    shouldTrackExit,
    trackEnter,
    trackExit,
    wasIntersecting,
  ]);
}

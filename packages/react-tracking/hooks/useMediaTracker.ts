import { MaybeRef, resolveMaybeRef } from "@codedazur/react-essentials";
import { useEffect, useRef } from "react";
import { useTracker } from "./useTracker";

export function useMediaTracker(
  ref: MaybeRef<HTMLMediaElement>,
  { percentiles = 0.25 }: { percentiles?: number | false } = {},
) {
  const { trackElement } = useTracker();
  const hasTrackedStart = useRef(false);
  const isSeeking = useRef(false);
  const progress = useRef(0);
  const largestProgress = useRef(0);

  useEffect(() => {
    const element = resolveMaybeRef(ref);

    if (!element) {
      return;
    }

    const handlePlay = () => {
      isSeeking.current = false;

      if (hasTrackedStart.current === false) {
        trackElement("media.start", element);
        hasTrackedStart.current = true;
      } else {
        trackElement("media.resume", element);
      }
    };

    const handleSeeking = () => {
      isSeeking.current = true;
    };

    const handlePause = () => {
      if (element.currentTime === element.duration) {
        return;
      }

      trackElement("media.pause", element);
    };

    const handleEnded = () => {
      if (isSeeking.current) {
        return;
      }

      trackElement("media.end", element);
    };

    const handleTimeUpdate = () => {
      if (!percentiles) {
        return;
      }

      const newProgress = element.currentTime / element.duration;

      if (
        !isSeeking.current &&
        newProgress > largestProgress.current &&
        newProgress < 1
      ) {
        const newPercentile = Math.floor(newProgress / percentiles);
        const currentPercentile = Math.floor(progress.current / percentiles);

        if (newPercentile > currentPercentile) {
          trackElement(
            `media.progress[${Math.round(newPercentile * percentiles * 100)}]`,
            element,
          );
        }
      }

      progress.current = newProgress;

      if (newProgress > largestProgress.current) {
        largestProgress.current = newProgress;
      }
    };

    element.addEventListener("play", handlePlay);
    element.addEventListener("seeking", handleSeeking);
    element.addEventListener("pause", handlePause);
    element.addEventListener("ended", handleEnded);

    if (percentiles !== false) {
      element.addEventListener("timeupdate", handleTimeUpdate);
    }

    return () => {
      element.removeEventListener("play", handlePlay);
      element.removeEventListener("pause", handlePause);
      element.removeEventListener("seeking", handleSeeking);
      element.removeEventListener("ended", handleEnded);

      if (percentiles !== false) {
        element.removeEventListener("timeupdate", handleTimeUpdate);
      }
    };
  }, [percentiles, ref, trackElement]);
}

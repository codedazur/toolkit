import { useUpdateLoop } from "@codedazur/react-essentials";
import { useCallback, useEffect, useState } from "react";
import { useMedia } from "./useMedia";

export const useMediaProgress = ({
  targetFps,
}: { targetFps?: number } | undefined = {}) => {
  const media = useMedia();

  const { element, isPlaying, duration, setTime, setProgress } = media;

  const [time, _setTime] = useState(element?.currentTime ?? 0);

  const onUpdate = useCallback(
    () => element && _setTime(element.currentTime),
    [element],
  );

  const { start, stop } = useUpdateLoop({
    onUpdate,
    targetFps,
  });

  useEffect(() => {
    if (isPlaying) {
      start();
    } else {
      stop();
    }
  }, [isPlaying, start, stop]);

  useEffect(() => {
    if (!element) {
      return;
    }

    const handleSeeked = () => {
      _setTime(element.currentTime);
    };

    element.addEventListener("seeked", handleSeeked);

    return () => {
      element.removeEventListener("seeked", handleSeeked);
    };
  }, [element]);

  return {
    time,
    setTime,
    progress: time / duration,
    setProgress,
  };
};

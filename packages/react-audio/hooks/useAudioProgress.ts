import { useUpdateLoop } from "@codedazur/react-essentials";
import { useCallback, useEffect, useState } from "react";
import { useAudio } from "./useAudio";

export const useAudioProgress = ({
  targetFps,
}: { targetFps?: number } | undefined = {}) => {
  const audio = useAudio();

  const { element, isPlaying, duration, setTime, setProgress } = audio;

  const [time, _setTime] = useState(element?.currentTime ?? 0);

  const onUpdate = useCallback(
    () => element && _setTime(element.currentTime),
    [element]
  );

  const { start, stop } = useUpdateLoop({
    onUpdate,
    targetFps,
  });

  useEffect(() => {
    isPlaying ? start() : stop();
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
    progress: duration ? time / duration : 0,
    setProgress,
  };
};

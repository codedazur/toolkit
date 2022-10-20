import { useEffect, useState } from "react";
import { useAudio } from "./useAudio";

export const useAudioVolume = () => {
  const { element, setVolume } = useAudio();

  const [volume, _setVolume] = useState<number>(element ? element.volume : 1);

  useEffect(() => {
    if (!element) return;

    const handleVolumeChange = () => _setVolume(element.volume);

    element.addEventListener("volumechange", handleVolumeChange);

    return () => {
      element.removeEventListener("volumechange", handleVolumeChange);
    };
  }, [element]);

  return {
    volume,
    setVolume,
  };
};

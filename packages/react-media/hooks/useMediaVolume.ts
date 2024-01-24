import { useEffect, useState } from "react";
import { useMedia } from "./useMedia";

export const useMediaVolume = () => {
  const { element, setVolume, isMuted, setIsMuted, mute, unmute } = useMedia();

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
    isMuted,
    setIsMuted,
    mute,
    unmute,
  };
};

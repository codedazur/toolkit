import { createContext } from "react";
import { MediaTrack } from "../components/MediaProvider";

export interface MediaContext<T extends MediaTrack = MediaTrack> {
  element: HTMLMediaElement | null;
  tracks: T[];
  setTracks: (tracks: T[]) => void;
  cursor: number;
  setCursor: (index: number) => void;
  track: T | undefined;
  setTrack: (track: T) => void;
  isPlaying: boolean;
  play: () => void;
  pause: () => void;
  stop: () => void;
  isMuted: boolean;
  setIsMuted(muted: boolean): void;
  mute: () => void;
  unmute: () => void;
  setVolume: (volume: number) => void;
  addTrack: (track: T) => void;
  insertTrack: (track: T) => void;
  canPlayPrevious: boolean;
  previous: () => void;
  canPlayNext: boolean;
  next: () => void;
  shuffle: boolean;
  setShuffle: (shuffle: boolean) => void;
  toggleShuffle: () => void;
  repeat: boolean;
  setRepeat: (repeat: boolean) => void;
  toggleRepeat: () => void;
  setTime: (time: number) => void;
  setProgress: (progress: number) => void;
  duration: number;
}

function error() {
  throw new Error("No MediaProvider found in ancestry.");
}

export const mediaContext = createContext<MediaContext>({
  element: null,
  tracks: [],
  setTracks: error,
  cursor: 0,
  setCursor: error,
  track: undefined,
  setTrack: error,
  isPlaying: false,
  play: error,
  pause: error,
  stop: error,
  isMuted: false,
  setIsMuted: error,
  mute: error,
  unmute: error,
  setVolume: error,
  addTrack: error,
  insertTrack: error,
  canPlayPrevious: false,
  previous: error,
  canPlayNext: false,
  next: error,
  shuffle: false,
  setShuffle: error,
  toggleShuffle: error,
  repeat: false,
  setRepeat: error,
  toggleRepeat: error,
  setTime: error,
  setProgress: error,
  duration: 0,
});

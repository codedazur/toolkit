import { modulo, shuffle as shuffleArray } from "@codedazur/essentials";
import { useSynchronizedRef } from "@codedazur/react-essentials";
import {
  createContext,
  ReactNode,
  SetStateAction,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

export type AudioTrack = string | { source: string };

export interface AudioContext<T extends AudioTrack = AudioTrack> {
  element: HTMLAudioElement | undefined;
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
  setVolume: (volume: number) => void;
  addTrack: (track: T) => void;
  insertTrack: (track: T) => void;
  canPlayPrevious: boolean;
  previous: () => void;
  canPlayNext: boolean;
  next: () => void;
  autoPlay: boolean;
  setAutoPlay: (autoPlay: boolean) => void;
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
  throw new Error("No AudioProvider found in ancestry.");
}

export const audioContext = createContext<AudioContext>({
  element: undefined,
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
  setVolume: error,
  addTrack: error,
  insertTrack: error,
  canPlayPrevious: false,
  previous: error,
  canPlayNext: false,
  next: error,
  autoPlay: false,
  setAutoPlay: error,
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

interface AudioProviderProps {
  tracks?: AudioTrack[];
  cursor?: number;
  volume?: number;
  autoPlay?: boolean;
  repeat?: boolean;
  shuffle?: boolean;
  children?: ReactNode;
}

export function AudioProvider({
  tracks: initialTracks = [],
  cursor: initialCursor = 0,
  autoPlay: initialAutoPlay = true,
  repeat: initialRepeat = false,
  shuffle: initialShuffle = false,
  children,
}: AudioProviderProps) {
  const [tracks, setTracks] = useState<AudioTrack[]>(initialTracks);
  const [shuffled, setShuffled] = useState<AudioTrack[]>(
    initialShuffle ? shuffleArray([...initialTracks]) : initialTracks
  );
  const [cursor, _setCursor] = useState<number>(initialCursor);

  const track = useMemo<AudioTrack | undefined>(
    () => shuffled[cursor],
    [shuffled, cursor]
  );
  const trackRef = useSynchronizedRef(track);

  const element = useMemo(
    () => (typeof Audio !== "undefined" ? new Audio() : undefined),
    []
  );

  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const isPlayingRef = useSynchronizedRef(isPlaying);
  const [autoPlay, setAutoPlay] = useState<boolean>(initialAutoPlay);
  const [shuffle, setShuffle] = useState<boolean>(initialShuffle);
  const [repeat, setRepeat] = useState<boolean>(initialRepeat);
  const repeatRef = useSynchronizedRef(repeat);
  const [duration, _setDuration] = useState(0);

  const play = useCallback(() => {
    setIsPlaying(true);
  }, [setIsPlaying]);

  const pause = useCallback(() => {
    setIsPlaying(false);
  }, [setIsPlaying]);

  const stop = useCallback(() => {
    pause();

    if (element) {
      element.currentTime = 0;
    }
  }, [pause, element]);

  const setVolume = useCallback(
    (volume: number) => {
      if (!element) return;
      element.volume = volume;
    },
    [element]
  );

  const addTrack = useCallback(
    (track: AudioTrack) => {
      setTracks((tracks) => [...tracks, track]);
    },
    [setTracks]
  );

  const insertTrack = useCallback(
    (track: AudioTrack) => {
      setTracks((tracks) => [
        ...tracks.slice(0, cursor),
        track,
        ...tracks.slice(cursor),
      ]);
    },
    [cursor]
  );

  const setCursor = useCallback(
    (action: SetStateAction<number>) => {
      _setCursor((cursor) => {
        const newCursor = action instanceof Function ? action(cursor) : action;

        return repeatRef.current
          ? modulo(newCursor, tracks.length)
          : Math.max(0, Math.min(newCursor, tracks.length - 1));
      });
    },
    [_setCursor, repeatRef, tracks]
  );

  const setTrack = useCallback(
    (track: AudioTrack) => {
      setTracks([track]);
    },
    [setTracks]
  );

  const canPlayNext = useMemo(
    () => repeat || cursor < tracks.length - 1,
    [repeat, cursor, tracks]
  );

  const next = useCallback(() => {
    if (canPlayNext) {
      setCursor((cursor) => cursor + 1);
      play();
    }
  }, [canPlayNext, setCursor, play]);

  const canPlayPrevious = useMemo(() => cursor > 0, [cursor]);

  const previous = useCallback(() => {
    if (canPlayPrevious) {
      setCursor((cursor) => cursor - 1);
      play();
    }
  }, [canPlayPrevious, setCursor, play]);

  const toggleShuffle = useCallback(
    () => setShuffle((shuffle) => !shuffle),
    []
  );

  const toggleRepeat = useCallback(() => setRepeat((repeat) => !repeat), []);

  /**
   * Pause the audio element when the provider is unrendered.
   */
  useEffect(() => () => element && element.pause(), [element]);

  /**
   * Bind event handlers to the audio element.
   */
  useEffect(() => {
    if (!element) return;

    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);
    const handleDurationChange = () => _setDuration(element.duration);

    element.addEventListener("play", handlePlay);
    element.addEventListener("pause", handlePause);
    element.addEventListener("durationchange", handleDurationChange);

    return () => {
      element.removeEventListener("play", handlePlay);
      element.removeEventListener("pause", handlePause);
      element.removeEventListener("durationchange", handleDurationChange);
    };
  }, [element]);

  /**
   * Change the audio element source when the track changes, continuing playback
   * if the element was already playing, or pausing the element when no track is
   * selected.
   */
  useEffect(() => {
    if (!element) return;

    if (track) {
      element.src = typeof track === "string" ? track : track.source;

      if (isPlayingRef.current) {
        void element.play();
      }
    } else {
      element.pause();
      element.currentTime = 0;
    }
  }, [track, element, isPlayingRef]);

  /**
   * Tell the audio element to pause and play.
   */
  useEffect(() => {
    if (!element) return;

    isPlaying ? setTimeout(() => void element.play(), 1) : element.pause();
  }, [element, isPlaying]);

  const setTime = useCallback(
    (time: number) => {
      if (!element) return;

      element.currentTime = time;
    },
    [element]
  );

  const setProgress = useCallback(
    (progress: number) => {
      setTime(progress * duration);
    },
    [duration, setTime]
  );

  /**
   * Clamp the cursor when the tracks change.
   */
  useEffect(() => {
    setCursor((cursor) => cursor);
  }, [tracks, setCursor]);

  /**
   * If `autoPlay` is enabled, automatically play the current track when it
   * changes, even when the audio element wasn't already playing.
   */
  const readyRef = useRef(false);
  useEffect(() => {
    if (autoPlay && readyRef.current === true) {
      play();
    }
    readyRef.current = true;
  }, [track, autoPlay, play]);

  /**
   * Tell the audio player what to do when the track ends. If `autoPlay` is
   * enabled, it should continue to the next track if there is one, otherwise
   * it should stop.
   */
  useEffect(() => {
    if (!element) return;

    const handleEnded = autoPlay && canPlayNext ? next : stop;

    element.addEventListener("ended", handleEnded);

    return () => {
      element.removeEventListener("ended", handleEnded);
    };
  }, [element, autoPlay, next, stop, canPlayNext]);

  /**
   * Shuffle the tracks, shifting the cursor to retain the active track.
   */
  useEffect(() => {
    const newTracks = shuffle ? shuffleArray([...tracks]) : tracks;
    setShuffled(newTracks);

    const newCursor = trackRef.current
      ? newTracks.indexOf(trackRef.current)
      : undefined;

    if (newCursor !== undefined) {
      setCursor(newCursor);
    }
  }, [shuffle, tracks, trackRef, setCursor]);

  const context: AudioContext = {
    element,
    tracks: shuffled,
    setTracks,
    cursor,
    setCursor,
    track,
    setTrack,
    isPlaying,
    play,
    pause,
    stop,
    setVolume,
    addTrack,
    insertTrack,
    canPlayPrevious,
    previous,
    canPlayNext,
    next,
    autoPlay,
    setAutoPlay,
    shuffle,
    setShuffle,
    toggleShuffle,
    repeat,
    setRepeat,
    toggleRepeat,
    setTime,
    setProgress,
    duration,
  };

  return (
    <audioContext.Provider value={context}>{children}</audioContext.Provider>
  );
}

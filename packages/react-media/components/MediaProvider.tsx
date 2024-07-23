"use client";

import { modulo, shuffle as shuffleArray } from "@codedazur/essentials";
import {
  MaybeRef,
  resolveMaybeRef,
  useSynchronizedRef,
} from "@codedazur/react-essentials";
import {
  ReactNode,
  SetStateAction,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { MediaContext, mediaContext } from "../contexts/mediaContext";

export type MediaTrack = string | { source: string };

interface MediaProviderProps {
  element?: MaybeRef<HTMLMediaElement>;
  tracks?: MediaTrack[];
  cursor?: number;
  volume?: number;
  autoPlay?: boolean;
  autoAdvance?: boolean;
  repeat?: boolean;
  shuffle?: boolean;
  children?: ReactNode;
}

export function MediaProvider({
  element: initialElement,
  tracks: initialTracks = [],
  cursor: initialCursor = 0,
  volume: initialVolume,
  autoPlay = false,
  autoAdvance = true,
  repeat: initialRepeat = false,
  shuffle: initialShuffle = false,
  children,
}: MediaProviderProps) {
  const [tracks, setTracks] = useState<MediaTrack[]>(initialTracks);
  const [shuffled, setShuffled] = useState<MediaTrack[]>(
    initialShuffle ? shuffleArray([...initialTracks]) : initialTracks,
  );
  const [cursor, _setCursor] = useState<number>(initialCursor);

  const track = useMemo<MediaTrack | undefined>(
    () => shuffled[cursor],
    [shuffled, cursor],
  );
  const trackRef = useSynchronizedRef(track);

  const internalElementRef: MaybeRef<HTMLMediaElement> = useRef(
    typeof window !== "undefined"
      ? window.document.createElement("video")
      : null,
  );
  const elementRef: MaybeRef<HTMLMediaElement> =
    initialElement ?? internalElementRef;

  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const isPlayingRef = useSynchronizedRef(isPlaying);
  const [shuffle, setShuffle] = useState<boolean>(initialShuffle);
  const [repeat, setRepeat] = useState<boolean>(initialRepeat);
  const repeatRef = useSynchronizedRef(repeat);
  const [duration, setDuration] = useState(0);
  const [isMuted, setIsMuted] = useState(false);

  const setTime = useCallback(
    (time: number) => {
      const element = resolveMaybeRef(elementRef);
      if (!element) return;

      element.currentTime = time;
    },
    [elementRef],
  );

  const setProgress = useCallback(
    (progress: number) => {
      setTime(progress * duration);
    },
    [duration, setTime],
  );

  const play = useCallback(() => {
    const element = resolveMaybeRef(elementRef);
    if (!element) return;

    /**
     * Delay the play request by exactly two ticks to prevent the browser from
     * interrupting it due to a new load request ocurring on the same tick.
     */
    setTimeout(() => setTimeout(() => element.play(), 0), 0);
  }, [elementRef]);

  const pause = useCallback(() => {
    const element = resolveMaybeRef(elementRef);
    if (!element) return;

    element.pause();
  }, [elementRef]);

  const stop = useCallback(() => {
    const element = resolveMaybeRef(elementRef);

    if (!element) {
      return;
    }

    pause();
    setTime(0);
  }, [pause, elementRef, setTime]);

  const mute = useCallback(() => {
    const element = resolveMaybeRef(elementRef);

    if (!element) return;

    element.muted = true;
  }, [elementRef]);

  const unmute = useCallback(() => {
    const element = resolveMaybeRef(elementRef);

    if (!element) return;

    element.muted = false;
  }, [elementRef]);

  const setVolume = useCallback(
    (volume: number) => {
      const element = resolveMaybeRef(elementRef);
      if (!element) return;

      element.volume = volume;
    },
    [elementRef],
  );

  useEffect(() => {
    if (initialVolume) {
      setVolume(initialVolume);
    }
  }, [initialVolume, setVolume]);

  const addTrack = useCallback(
    (track: MediaTrack) => {
      setTracks((tracks) => [...tracks, track]);
    },
    [setTracks],
  );

  const insertTrack = useCallback(
    (track: MediaTrack) => {
      setTracks((tracks) => [
        ...tracks.slice(0, cursor),
        track,
        ...tracks.slice(cursor),
      ]);
    },
    [cursor],
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
    [_setCursor, repeatRef, tracks],
  );

  const setTrack = useCallback(
    (track: MediaTrack) => {
      setTracks([track]);
    },
    [setTracks],
  );

  const canPlayNext = useMemo(
    () => repeat || cursor < tracks.length - 1,
    [repeat, cursor, tracks],
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
    [],
  );

  const toggleRepeat = useCallback(() => setRepeat((repeat) => !repeat), []);

  /**
   * Pause the media element when the provider is unrendered.
   */
  useEffect(
    () => () => {
      pause();
    },
    [pause],
  );

  /**
   * Bind event handlers to the media element.
   */
  useEffect(() => {
    const element = resolveMaybeRef(elementRef);
    if (!element) return;

    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);
    const handleDurationChange = () => setDuration(element.duration);
    const handleVolumeChange = () => setIsMuted(element.muted);

    const handleEnded = () => {
      if (autoAdvance && canPlayNext) {
        next();
      } else {
        stop();
      }
    };

    handleVolumeChange();

    element.addEventListener("play", handlePlay);
    element.addEventListener("pause", handlePause);
    element.addEventListener("ended", handleEnded);
    element.addEventListener("volumechange", handleVolumeChange);
    element.addEventListener("durationchange", handleDurationChange);

    return () => {
      element.removeEventListener("play", handlePlay);
      element.removeEventListener("pause", handlePause);
      element.removeEventListener("ended", handleEnded);
      element.removeEventListener("volumechange", handleVolumeChange);
      element.removeEventListener("durationchange", handleDurationChange);
    };
  }, [
    elementRef,
    setIsPlaying,
    setDuration,
    setIsMuted,
    autoAdvance,
    canPlayNext,
    next,
    stop,
  ]);

  /**
   * Change the media element source when the track changes, continuing playback
   * if the element was already playing, or pausing the element when no track is
   * selected.
   */
  useEffect(() => {
    const element = resolveMaybeRef(elementRef);
    if (!element) return;

    if (track) {
      element.src = typeof track === "string" ? track : track.source;

      if (isPlayingRef.current) {
        play();
      }
    } else {
      pause();
      setTime(0);
    }
  }, [track, elementRef, isPlayingRef, play, pause, setTime]);

  /**
   * Clamp the cursor when the tracks change.
   */
  useEffect(() => {
    setCursor((cursor) => cursor);
  }, [tracks, setCursor]);

  /**
   * Configure the initial element attributes.
   */
  useEffect(() => {
    const element = resolveMaybeRef(elementRef);
    if (!element) return;

    element.autoplay = autoPlay;
  }, [autoPlay, elementRef]);

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

  const context: MediaContext = {
    element: resolveMaybeRef(elementRef),
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
    isMuted,
    setIsMuted,
    mute,
    unmute,
    setVolume,
    addTrack,
    insertTrack,
    canPlayPrevious,
    previous,
    canPlayNext,
    next,
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
    <mediaContext.Provider value={context}>{children}</mediaContext.Provider>
  );
}

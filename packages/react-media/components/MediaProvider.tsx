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
  repeat?: boolean;
  shuffle?: boolean;
  children?: ReactNode;
}

export function MediaProvider({
  element: initialElement,
  tracks: initialTracks = [],
  cursor: initialCursor = 0,
  autoPlay: initialAutoPlay = true,
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

    const element = resolveMaybeRef(elementRef);

    if (element) {
      element.currentTime = 0;
    }
  }, [pause, elementRef]);

  const setVolume = useCallback(
    (volume: number) => {
      const element = resolveMaybeRef(elementRef);

      if (!element) return;

      element.volume = volume;
    },
    [elementRef],
  );

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
      const element = resolveMaybeRef(elementRef);
      element && element.pause();
    },
    [elementRef],
  );

  /**
   * Bind event handlers to the media element.
   */
  useEffect(() => {
    const element = resolveMaybeRef(elementRef);
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
  }, [elementRef]);

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
        void element.play();
      }
    } else {
      element.pause();
      element.currentTime = 0;
    }
  }, [track, elementRef, isPlayingRef]);

  /**
   * Tell the media element to pause and play.
   */
  useEffect(() => {
    const element = resolveMaybeRef(elementRef);
    if (!element) return;

    isPlaying ? setTimeout(() => void element.play(), 1) : element.pause();
  }, [elementRef, isPlaying]);

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

  /**
   * Clamp the cursor when the tracks change.
   */
  useEffect(() => {
    setCursor((cursor) => cursor);
  }, [tracks, setCursor]);

  /**
   * If `autoPlay` is enabled, automatically play the current track when it
   * changes, even when the media element wasn't already playing.
   */
  const readyRef = useRef(false);
  useEffect(() => {
    if (autoPlay && readyRef.current === true) {
      play();
    }
    readyRef.current = true;
  }, [track, autoPlay, play]);

  /**
   * Tell the media element what to do when the track ends. If `autoPlay` is
   * enabled, it should continue to the next track if there is one, otherwise
   * it should stop.
   */
  useEffect(() => {
    const element = resolveMaybeRef(elementRef);
    if (!element) return;

    const handleEnded = autoPlay && canPlayNext ? next : stop;

    element.addEventListener("ended", handleEnded);

    return () => {
      element.removeEventListener("ended", handleEnded);
    };
  }, [elementRef, autoPlay, next, stop, canPlayNext]);

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
    <mediaContext.Provider value={context}>{children}</mediaContext.Provider>
  );
}

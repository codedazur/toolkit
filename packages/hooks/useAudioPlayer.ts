import { useSynchronizedRef } from "@codedazur/hooks";
import { shuffle as shuffleArray } from "@codedazur/utilities/array";
import { modulo } from "@codedazur/utilities/math";
import {
  SetStateAction,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

function resolveSource(track: string | { source: string }): string {
  return typeof track === "string" ? track : track.source;
}

/**
 * @todo Add a queue. This is a list separate from the playlist. The `next`
 * function will play the first track it finds on the queue, or if there is no
 * track in the queue, it will increment the cursor instead.
 */
export function useAudioPlayer<T extends string | { source: string }>({
  tracks: initialTracks = [],
  cursor: initialCursor = 0,
  volume: initialVolume = 1,
  autoPlay: initialAutoPlay = true,
  repeat: initialRepeat = false,
  shuffle: initialShuffle = false,
}: {
  tracks?: T[];
  cursor?: number;
  volume?: number;
  autoPlay?: boolean;
  repeat?: boolean;
  shuffle?: boolean;
} = {}) {
  const [tracks, setTracks] = useState<T[]>(initialTracks);
  const [shuffled, setShuffled] = useState<T[]>(
    initialShuffle ? shuffleArray([...initialTracks]) : initialTracks
  );
  const [cursor, _setCursor] = useState<number>(initialCursor);

  const track = useMemo<T | undefined>(
    () => shuffled[cursor],
    [shuffled, cursor]
  );
  const trackRef = useSynchronizedRef(track);

  const [player] = useState<HTMLAudioElement>(
    new Audio(track ? resolveSource(track) : undefined)
  );
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const isPlayingRef = useSynchronizedRef(isPlaying);
  const [volume, setVolume] = useState<number>(initialVolume);
  const [autoPlay, setAutoPlay] = useState<boolean>(initialAutoPlay);
  const [shuffle, setShuffle] = useState<boolean>(initialShuffle);
  const [repeat, setRepeat] = useState<boolean>(initialRepeat);
  const repeatRef = useSynchronizedRef(repeat);

  const [time, _setTime] = useState(0);
  const [duration, _setDuration] = useState(0);

  useEffect(() => {
    player.onplay = () => setIsPlaying(true);
    player.onpause = () => setIsPlaying(false);
    player.ontimeupdate = () => _setTime(player.currentTime);
    player.ondurationchange = () => _setDuration(player.duration);

    return () => {
      player.onplay = null;
      player.onpause = null;
      player.ontimeupdate = null;
      player.ondurationchange = null;

      player.pause();
    };
  }, [player]);

  useEffect(() => {
    if (track) {
      player.src = typeof track === "string" ? track : track.source;

      if (isPlayingRef.current) {
        void player.play();
      }
    } else {
      player.pause();
      player.currentTime = 0;
    }
  }, [track, player, isPlayingRef]);

  useEffect(() => {
    player.volume = volume;
  }, [player, volume]);

  useEffect(() => {
    isPlaying ? setTimeout(() => void player.play(), 1) : player.pause();
  }, [player, isPlaying]);

  const setTime = useCallback(
    (time: number) => {
      player.currentTime = time;
    },
    [player]
  );

  const pause = useCallback(() => {
    setIsPlaying(false);
  }, [setIsPlaying]);

  const play = useCallback(() => {
    setIsPlaying(true);
  }, [setIsPlaying]);

  const stop = useCallback(() => {
    pause();
    player.currentTime = 0;
  }, [pause, player]);

  const addTrack = useCallback(
    (track: T) => {
      setTracks((tracks) => [...tracks, track]);
    },
    [setTracks]
  );

  const insertTrack = useCallback(
    (track: T) => {
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
    (track: T) => {
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

  /**
   * Clamp the cursor when the tracks change.
   */
  useEffect(() => {
    setCursor((cursor) => cursor);
  }, [tracks, setCursor]);

  /**
   * Automatically play the current track when it changes.
   */
  const readyRef = useRef(false);
  useEffect(() => {
    if (autoPlay && readyRef.current === true) {
      play();
    }
    readyRef.current = true;
  }, [track, autoPlay, play]);

  useEffect(() => {
    player.onended = autoPlay && canPlayNext ? next : stop;
  }, [player, autoPlay, next, stop, canPlayNext]);

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

  const toggleShuffle = useCallback(
    () => setShuffle((shuffle) => !shuffle),
    []
  );

  const toggleRepeat = useCallback(() => setRepeat((repeat) => !repeat), []);

  return {
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
    volume,
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
    time,
    setTime,
    duration,
  };
}

import { Timer } from "@codedazur/essentials";
import { useCallback, useEffect, useRef, useState } from "react";
import { useDelta } from "./useDelta";
import { useSynchronizedRef } from "./useSynchronizedRef";
import { useUpdateLoop } from "./useUpdateLoop";

export function useTimer(callback: () => void, duration: number) {
  const callbackRef = useSynchronizedRef(callback);

  const dynamicCallback = useCallback(() => {
    setStatus("stopped");
    callbackRef.current?.();
  }, [callbackRef]);

  const deltaDuration = useDelta(duration);

  const timer = useRef<Timer>(new Timer(dynamicCallback, duration));

  const [status, setStatus] = useState<"running" | "paused" | "stopped">(
    "stopped"
  );
  const [_duration, setDuration] = useState<number>(timer.current.duration);

  useEffect(() => {
    if (deltaDuration > 0) {
      timer.current.extend(deltaDuration);
      setDuration(timer.current.duration);
    }
  }, [deltaDuration]);

  const start = useCallback(() => {
    timer.current.start();
    setStatus("running");
  }, []);

  const stop = useCallback(() => {
    timer.current.stop();
    setStatus("stopped");
  }, []);

  const pause = useCallback(() => {
    timer.current.pause();
    setStatus("paused");
  }, []);

  const resume = useCallback(() => {
    timer.current.resume();
    setStatus("running");
  }, []);

  const extend = useCallback(
    (by: number) => {
      timer.current.extend(by);
      setDuration(duration + by);
    },
    [duration]
  );

  const end = useCallback(() => {
    timer.current.end();
    setStatus("stopped");
  }, []);

  const useProgress = useCallback(function useProgress({
    targetFps,
  }: { targetFps?: number } = {}) {
    return useTimerProgress(timer.current, { targetFps });
  },
  []);

  return {
    start,
    stop,
    pause,
    resume,
    extend,
    end,
    isRunning: status === "running",
    isPaused: status !== "running",
    duration: _duration,
    startedAt: timer.current.startedAt,
    useProgress,
  };
}

export function useTimerProgress(
  timer: Timer,
  options: { targetFps?: number; immediately?: boolean } = {}
) {
  const [progress, setProgress] = useState(timer.progress);

  const onUpdate = useCallback(() => {
    setProgress(timer.progress);
  }, [timer]);

  const { start, stop } = useUpdateLoop({ onUpdate, ...options });

  useEffect(() => {
    timer.addEventListener("start", start);
    timer.addEventListener("resume", start);
    timer.addEventListener("pause", stop);
    timer.addEventListener("stop", stop);
    timer.addEventListener("stop", onUpdate);
    timer.addEventListener("extend", onUpdate);
    timer.addEventListener("end", onUpdate);

    return () => {
      timer.removeEventListener("start", start);
      timer.removeEventListener("resume", start);
      timer.removeEventListener("pause", stop);
      timer.removeEventListener("stop", stop);
      timer.removeEventListener("stop", onUpdate);
      timer.removeEventListener("extend", onUpdate);
      timer.removeEventListener("end", onUpdate);
    };
  }, [onUpdate, start, stop, timer]);

  return {
    progress: progress,
    elapsed: timer.elapsed,
    remaining: timer.remaining,
    duration: timer.duration,
  };
}

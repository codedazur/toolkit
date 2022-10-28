import { Timer } from "@codedazur/essentials";
import { useCallback, useEffect, useRef, useState } from "react";
import { useDelta } from "./useDelta";
import { useSynchronizedRef } from "./useSynchronizedRef";
import { useUpdateLoop } from "./useUpdateLoop";

type Status = "running" | "paused" | "stopped";

export function useTimer(callback: () => void, duration: number) {
  const callbackRef = useSynchronizedRef(callback);

  const dynamicCallback = useCallback(() => {
    callbackRef.current?.();
  }, [callbackRef]);

  const timerRef = useRef<Timer>(new Timer(dynamicCallback, duration));

  const [_status, setStatus] = useState<Status>("stopped");
  const [_duration, setDuration] = useState<number>(duration);

  const deltaDuration = useDelta(duration);

  useEffect(() => {
    const timer = timerRef.current;

    const reflectStatus = () => setStatus(timer.status);
    const reflectDuration = () => setDuration(timer.duration);

    timer.addEventListener("start", reflectStatus);
    timer.addEventListener("stop", reflectStatus);
    timer.addEventListener("pause", reflectStatus);
    timer.addEventListener("resume", reflectStatus);
    timer.addEventListener("end", reflectStatus);
    timer.addEventListener("extend", reflectDuration);

    return () => {
      timer.removeEventListener("start", reflectStatus);
      timer.removeEventListener("stop", reflectStatus);
      timer.removeEventListener("pause", reflectStatus);
      timer.removeEventListener("resume", reflectStatus);
      timer.removeEventListener("end", reflectStatus);
      timer.removeEventListener("extend", reflectDuration);
    };
  }, [timerRef]);

  useEffect(() => {
    if (deltaDuration > 0) {
      timerRef.current.extend(deltaDuration);
    }
  }, [deltaDuration]);

  const useProgress = useCallback(function useProgress({
    targetFps,
  }: { targetFps?: number } = {}) {
    return useTimerProgress(timerRef.current, { targetFps });
  },
  []);

  return {
    status: _status,
    isRunning: _status === "running",
    isPaused: _status === "paused",
    isStopped: _status === "stopped",
    duration: _duration,
    startedAt: timerRef.current.startedAt,
    start: timerRef.current.start,
    stop: timerRef.current.stop,
    pause: timerRef.current.pause,
    resume: timerRef.current.resume,
    extend: timerRef.current.extend,
    end: timerRef.current.end,
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

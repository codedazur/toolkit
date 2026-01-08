import { Timer, TimerEvent, TimerStatus } from "@codedazur/essentials";
import { useCallback, useEffect, useRef, useState } from "react";
import { useMotionValue } from "framer-motion";
import { useSynchronizedRef } from "./useSynchronizedRef";
import { useUpdateLoop } from "./useUpdateLoop";
export { TimerEvent, TimerStatus } from "@codedazur/essentials";

export function useTimer(callback: () => void, duration: number) {
  const callbackRef = useSynchronizedRef(callback);

  const dynamicCallback = useCallback(() => {
    callbackRef.current?.();
  }, [callbackRef]);

  const timerRef = useRef<Timer>(new Timer(dynamicCallback, duration));

  const [_status, setStatus] = useState<TimerStatus>(TimerStatus.stopped);
  const [_duration, setDuration] = useState<number>(duration);

  useEffect(() => {
    const timer = timerRef.current;

    const reflectStatus = () => setStatus(timer.status);
    const reflectDuration = () => setDuration(timer.duration);

    timer.addEventListener(TimerEvent.start, reflectStatus);
    timer.addEventListener(TimerEvent.stop, reflectStatus);
    timer.addEventListener(TimerEvent.pause, reflectStatus);
    timer.addEventListener(TimerEvent.resume, reflectStatus);
    timer.addEventListener(TimerEvent.end, reflectStatus);
    timer.addEventListener(TimerEvent.changeDuration, reflectDuration);
    timer.addEventListener(TimerEvent.changeDuration, reflectStatus);

    return () => {
      timer.removeEventListener(TimerEvent.start, reflectStatus);
      timer.removeEventListener(TimerEvent.stop, reflectStatus);
      timer.removeEventListener(TimerEvent.pause, reflectStatus);
      timer.removeEventListener(TimerEvent.resume, reflectStatus);
      timer.removeEventListener(TimerEvent.end, reflectStatus);
      timer.removeEventListener(TimerEvent.changeDuration, reflectDuration);
      timer.removeEventListener(TimerEvent.changeDuration, reflectStatus);
    };
  }, [timerRef]);

  useEffect(() => {
    timerRef.current.setDuration(duration);
  }, [duration]);

  const useProgress = useCallback(function useProgress({
    targetFps,
  }: { targetFps?: number } = {}) {
    return useSyncTimerProgress(timerRef.current, { targetFps });
  }, []);

  return {
    status: _status,
    duration: _duration,
    startedAt: timerRef.current.startedAt,
    start: timerRef.current.start,
    stop: timerRef.current.stop,
    pause: timerRef.current.pause,
    resume: timerRef.current.resume,
    extend: timerRef.current.extend,
    setDuration: timerRef.current.setDuration,
    end: timerRef.current.end,
    /**
     * @deprecated Use the MotionValue-based `useTimerProgress` hook instead.
     */
    useProgress,
  };
}

/**
 * @deprecated Use the MotionValue-based `useTimerProgress` hook instead.
 */
export function useSyncTimerProgress(
  timer: Timer,
  options: { targetFps?: number } = {},
) {
  const [progress, setProgress] = useState(timer.progress);

  const onUpdate = useCallback(() => {
    setProgress(timer.progress);
  }, [timer]);

  const { start, stop } = useUpdateLoop({
    onUpdate,
    immediately: timer.isRunning,
    ...options,
  });

  useEffect(() => {
    timer.addEventListener(TimerEvent.start, start);
    timer.addEventListener(TimerEvent.resume, start);
    timer.addEventListener(TimerEvent.pause, stop);
    timer.addEventListener(TimerEvent.stop, stop);
    timer.addEventListener(TimerEvent.stop, onUpdate);
    timer.addEventListener(TimerEvent.changeDuration, onUpdate);
    timer.addEventListener(TimerEvent.end, onUpdate);

    return () => {
      timer.removeEventListener(TimerEvent.start, start);
      timer.removeEventListener(TimerEvent.resume, start);
      timer.removeEventListener(TimerEvent.pause, stop);
      timer.removeEventListener(TimerEvent.stop, stop);
      timer.removeEventListener(TimerEvent.stop, onUpdate);
      timer.removeEventListener(TimerEvent.changeDuration, onUpdate);
      timer.removeEventListener(TimerEvent.end, onUpdate);
    };
  }, [onUpdate, start, stop, timer]);

  return {
    progress,
    elapsed: timer.elapsed,
    remaining: timer.remaining,
    duration: timer.duration,
  };
}

/**
 * As opposed to the timer.useProgress() hook, the useTimerProgress() hook makes
 * use of Motion's MotionValues.
 */
export function useTimerProgress(
  timer?: Timer,
  options: { targetFps?: number } = {},
) {
  const progress = useMotionValue(timer?.progress ?? 0);
  const elapsed = useMotionValue(timer?.elapsed ?? 0);
  const remaining = useMotionValue(timer?.remaining ?? 0);

  const onUpdate = useCallback(() => {
    if (!timer) return;

    progress.set(timer.progress);
    elapsed.set(timer.elapsed);
    remaining.set(timer.remaining);
  }, [progress, elapsed, remaining, timer]);

  const { start, stop } = useUpdateLoop({
    onUpdate,
    immediately: timer?.isRunning,
    ...options,
  });

  useEffect(() => {
    if (!timer) return;

    timer.addEventListener(TimerEvent.start, start);
    timer.addEventListener(TimerEvent.resume, start);
    timer.addEventListener(TimerEvent.pause, stop);
    timer.addEventListener(TimerEvent.stop, stop);
    timer.addEventListener(TimerEvent.stop, onUpdate);
    timer.addEventListener(TimerEvent.changeDuration, onUpdate);
    timer.addEventListener(TimerEvent.end, onUpdate);

    return () => {
      timer.removeEventListener(TimerEvent.start, start);
      timer.removeEventListener(TimerEvent.resume, start);
      timer.removeEventListener(TimerEvent.pause, stop);
      timer.removeEventListener(TimerEvent.stop, stop);
      timer.removeEventListener(TimerEvent.stop, onUpdate);
      timer.removeEventListener(TimerEvent.changeDuration, onUpdate);
      timer.removeEventListener(TimerEvent.end, onUpdate);
    };
  }, [onUpdate, start, stop, timer]);

  return {
    progress,
    elapsed,
    remaining,
    duration: timer?.duration ?? 0,
  };
}

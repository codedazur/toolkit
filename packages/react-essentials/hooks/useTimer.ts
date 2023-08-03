import { Timer, TimerEvent, TimerStatus } from "@codedazur/essentials";
import { useCallback, useEffect, useRef, useState } from "react";
import { useDelta } from "./useDelta";
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

  const deltaDuration = useDelta(duration);

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
    if (deltaDuration > 0) {
      // @todo: setDuration should be called here
      // timerRef.current.extend(deltaDuration);
      setDuration(timerRef.current.duration);
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
    duration: _duration,
    startedAt: timerRef.current.startedAt,
    start: timerRef.current.start,
    stop: timerRef.current.stop,
    pause: timerRef.current.pause,
    resume: timerRef.current.resume,
    extend: timerRef.current.extend,
    setDuration: timerRef.current.setDuration,
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
    progress: progress,
    elapsed: timer.elapsed,
    remaining: timer.remaining,
    duration: timer.duration,
  };
}

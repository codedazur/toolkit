import { useCallback, useEffect, useRef, useState } from "react";
import { useSynchronizedRef } from "./useSynchronizedRef";

export interface Frame {
  index: number;
  time: number;
  deltaTime: number;
  fps: number | undefined;
}

type Status = "stopped" | "started" | "paused";

export const useUpdateLoop = ({
  onUpdate,
  immediately = false,
  timeScale = 1,
  targetFps,
}: {
  onUpdate: (frame: Frame) => void;
  immediately?: boolean;
  timeScale?: number;
  targetFps?: number;
}) => {
  const onUpdateRef = useSynchronizedRef(onUpdate);

  const [status, setStatus] = useState<Status>("stopped");
  const isUpdating = useRef(false);

  const requestedFrameId = useRef<number>();
  const frame = useRef<number>();
  const time = useRef<number>();
  const previousTime = useRef<number>();
  const deltaTime = useRef<number>();
  const elapsedTime = useRef<number>();
  const scaledDeltaTime = useRef<number>();
  const scaledElapsedTime = useRef<number>();
  const checkTime = useRef<number>();
  const timeScaleRef = useRef<number>(timeScale);
  const targetIntervalRef = useRef<number>();

  useEffect(() => {
    timeScaleRef.current = timeScale;
  }, [timeScale]);

  useEffect(() => {
    targetIntervalRef.current =
      targetFps && targetFps > 0 ? 1000 / targetFps : undefined;
  }, [targetFps]);

  /**
   * @todo There is a bug in this hook, where updating the `onUpdate` prop does
   * not stop the current loop, or replace the callback _of_ the current loop,
   * but starts a new loop in _addition_ to the current loop.
   *
   * @todo This method could use some abstraction for readability's sake.
   */
  const step = useCallback(() => {
    if (!isUpdating.current) {
      return;
    }

    requestedFrameId.current = requestAnimationFrame(() => {
      const checkPrevious = checkTime.current;
      const checkNow = new Date().getTime();
      const checkDelta = checkPrevious ? checkNow - checkPrevious : 0;

      if (
        !targetIntervalRef.current ||
        !checkPrevious ||
        checkDelta >= targetIntervalRef.current
      ) {
        checkTime.current =
          checkNow -
          (targetIntervalRef.current
            ? checkDelta % targetIntervalRef.current
            : 0);

        frame.current = (frame.current ?? -1) + 1;
        previousTime.current = time.current;
        time.current = new Date().getTime();
        deltaTime.current = previousTime.current
          ? time.current - previousTime.current
          : 0;
        elapsedTime.current = (elapsedTime.current ?? 0) + deltaTime.current;

        scaledDeltaTime.current = deltaTime.current * timeScaleRef.current;
        scaledElapsedTime.current =
          (scaledElapsedTime.current ?? 0) + scaledDeltaTime.current;

        onUpdateRef.current?.({
          index: frame.current ?? 0,
          time: scaledElapsedTime.current ?? 0,
          deltaTime: scaledDeltaTime.current ?? 0,
          fps: scaledDeltaTime.current
            ? Math.round(1000 / scaledDeltaTime.current)
            : 0,
        });
      }

      step();
    });
  }, [onUpdateRef]);

  const _start = useCallback(() => {
    isUpdating.current = true;

    step();
  }, [step]);

  const _pause = useCallback(() => {
    isUpdating.current = false;
    time.current = undefined;

    if (requestedFrameId.current) {
      window.cancelAnimationFrame(requestedFrameId.current);
    }
  }, []);

  const _reset = useCallback(() => {
    frame.current = undefined;
    elapsedTime.current = undefined;
    checkTime.current = undefined;
  }, []);

  const start = useCallback(() => {
    setStatus("started");
    _start();
  }, [_start]);

  const pause = useCallback(() => {
    setStatus("paused");
    _pause();
  }, [_pause]);

  const stop = useCallback(() => {
    setStatus("stopped");
    _pause();
    _reset();
  }, [_pause, _reset]);

  useEffect(() => {
    if (immediately) {
      start();
    }
  }, [immediately, start]);

  useEffect(() => () => _pause(), [_pause]);

  return {
    status,
    start,
    pause,
    stop,
    isUpdating: isUpdating.current,
  };
};

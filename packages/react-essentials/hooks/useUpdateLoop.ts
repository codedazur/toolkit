import { useCallback, useEffect, useRef, useState } from "react";

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
  const averageDuration = useRef<number>();
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
        averageDuration.current = elapsedTime
          ? (elapsedTime.current ?? 0) / frame.current
          : undefined;

        scaledDeltaTime.current = deltaTime.current * timeScaleRef.current;
        scaledElapsedTime.current =
          (scaledElapsedTime.current ?? 0) + scaledDeltaTime.current;

        onUpdate({
          index: frame.current ?? 0,
          time: scaledElapsedTime.current ?? 0,
          deltaTime: scaledDeltaTime.current ?? 0,
          fps: averageDuration.current
            ? 1000 / averageDuration.current
            : undefined,
        });
      }

      step();
    });
  }, [onUpdate]);

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
    averageDuration.current = undefined;
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

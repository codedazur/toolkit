import { useCallback, useEffect, useRef, useState } from "react";
import { useSynchronizedRef } from "./useSynchronizedRef";

/**
 * Represents a frame with relevant information.
 */
export interface Frame {
  /**
   * The index of the frame.
   */
  index: number;
  /**
   * The time at the moment of this frane.
   */
  time: number;
  /**
   * The time difference between the current frame and the previous frame.
   */
  deltaTime: number;
  /**
   * The number of frames per second.
   * @todo This shouldn't be part of the `Frame` itself.
   */
  fps: number | undefined;
}

export interface UseUpdateLoopOptions {
  /**
   * Callback function to be called when the update loop starts.
   */
  onStart?: () => void;
  /**
   * Callback function to be called on each update.
   */
  onUpdate: (frame: Frame) => void;
  /**
   * Callback function to be called when the update loop stops.
   */
  onStop?: () => void;
  /**
   * Flag indicating whether to start the loop immediately.
   */
  immediately?: boolean;
  /**
   * Scaling factor for time. This will affect the `time` and `deltaTime`
   * attributes of each frame without affecting the framerate.
   */
  timeScale?: number;
  /**
   * Target frames per second. This value will affect the framerate without
   * affecting the time.
   */
  targetFps?: number;
}

/**
 * Manages an update loop that can be paused and stopped. You can provide a
 * target framerate, and you can adjust the time scale without affecting that
 * framerate.
 *
 * @todo There is a bug in this hook, where changing the `onUpdate` callback
 * does not stop the current loop, or replace the callback _of_ the current
 * loop, but starts a new loop in _addition_ to the current loop.
 *
 * @todo The `isUpdating` reference should be a state variable, so that the hook
 * causes a re-render when its value changes.
 */
export const useUpdateLoop = ({
  onStart,
  onUpdate,
  onStop,
  immediately = false,
  timeScale = 1,
  targetFps,
}: UseUpdateLoopOptions) => {
  /**
   * Synchronized referencne to the onUpdate callback.
   */
  const onUpdateRef = useSynchronizedRef(onUpdate);

  /**
   * Flag indicating whether the update loop is currently running.
   */
  const [isUpdating, setIsUpdating] = useState(false);

  /**
   * The ID of the requested animation frame.
   */
  const requestedFrameId = useRef<number>();

  /**
   * The index of the current frame.
   */
  const frame = useRef<number>();

  /**
   * The timestamp of the current frame.
   */
  const time = useRef<number>();

  /**
   * The timestamp of the previous frame.
   */
  const previousTime = useRef<number>();

  /**
   * Time difference between the current frame and the previous frame
   */
  const deltaTime = useRef<number>();

  /**
   * The total elapsed time since the start of the loop.
   */
  const elapsedTime = useRef<number>();

  /**
   * The deltaTime scaled to the timeScale.
   */
  const scaledDeltaTime = useRef<number>();

  /**
   * The total elapsed time scaled to the timeScale.
   */
  const scaledElapsedTime = useRef<number>();

  /**
   * The time since the last call to the `onUpdate` callback. This is used to
   * check whether enough time has passed to call `onUpdate` again given the
   * `targetFps`.
   */
  const checkTime = useRef<number>();

  /**
   * Reference to the `timeScale` value.
   */
  const timeScaleRef = useSynchronizedRef<number>(timeScale);

  /**
   * The target duration for a single frame given the `targetFps`.
   */
  const targetIntervalRef = useRef<number>();

  /**
   * Update the `targetIntervalRef` when the `targetFps` changes.
   */
  useEffect(() => {
    targetIntervalRef.current =
      targetFps && targetFps > 0 ? 1000 / targetFps : undefined;
  }, [targetFps]);

  /**
   * Increments the frame index.
   */
  const incrementFrame = useCallback(() => {
    frame.current = (frame.current ?? -1) + 1;
  }, []);

  /**
   * Sets various metrics for the current frame.
   */
  const setMetrics = useCallback(() => {
    previousTime.current = time.current;
    time.current = new Date().getTime();
    deltaTime.current = previousTime.current
      ? time.current - previousTime.current
      : 0;
    elapsedTime.current = (elapsedTime.current ?? 0) + deltaTime.current;

    scaledDeltaTime.current = deltaTime.current * timeScaleRef.current;
    scaledElapsedTime.current =
      (scaledElapsedTime.current ?? 0) + scaledDeltaTime.current;
  }, [timeScaleRef]);

  /**
   * Checks whether the `onUpdate` callback should be called given the
   * `targetFps` and the time elapsed since the previous call.
   */
  const shouldCallOnUpdate = useCallback(() => {
    const currentTime = new Date().getTime();
    const checkDelta = checkTime.current ? currentTime - checkTime.current : 0;

    if (
      !targetIntervalRef.current ||
      !checkTime.current ||
      checkDelta >= targetIntervalRef.current
    ) {
      checkTime.current =
        currentTime -
        (targetIntervalRef.current
          ? checkDelta % targetIntervalRef.current
          : 0);

      return true;
    }

    return false;
  }, []);

  /**
   * Calls the `onUpdate` callback with the current frame information.
   */
  const callOnUpdate = useCallback(() => {
    onUpdateRef.current?.({
      index: frame.current ?? 0,
      time: scaledElapsedTime.current ?? 0,
      deltaTime: scaledDeltaTime.current ?? 0,
      fps: deltaTime.current ? Math.round(1000 / deltaTime.current) : 0,
    });
  }, [onUpdateRef]);

  /**
   * Step function that iterates as fast as the screen's refresh rate, and calls
   * the `onUpdate` callback only if enough time has elapsed since the previous
   * call given the `targetFps`.
   */
  const step = useCallback(() => {
    requestedFrameId.current = requestAnimationFrame(() => {
      if (shouldCallOnUpdate()) {
        incrementFrame();
        setMetrics();
        callOnUpdate();
      }

      step();
    });
  }, [callOnUpdate, incrementFrame, setMetrics, shouldCallOnUpdate]);

  /**
   * Starts the update loop.
   */
  const start = useCallback(() => {
    setMetrics();
    onStart?.();
    setIsUpdating(true);
  }, [onStart, setMetrics]);

  /**
   * Pauses the update loop.
   */
  const pause = useCallback(() => {
    setIsUpdating(false);
  }, []);

  /**
   * Resets the update loop.
   */
  const reset = useCallback(() => {
    frame.current = undefined;
    time.current = undefined;
    previousTime.current = undefined;
    deltaTime.current = undefined;
    elapsedTime.current = undefined;
    scaledDeltaTime.current = undefined;
    scaledElapsedTime.current = undefined;
    checkTime.current = undefined;
  }, []);

  /**
   * Stops the update loop.
   */
  const stop = useCallback(() => {
    pause();
    reset();
    onStop?.();
  }, [onStop, pause, reset]);

  /**
   * Kickstart the loop whenever updates are enebaled.
   */
  useEffect(() => {
    if (isUpdating) {
      step();
    } else {
      time.current = undefined;

      if (requestedFrameId.current) {
        window.cancelAnimationFrame(requestedFrameId.current);
      }
    }
  }, [isUpdating, step]);

  /**
   * Start the update loop immediately if requested.
   */
  useEffect(() => {
    if (immediately) {
      start();
    }
  }, [immediately, start]);

  /**
   * Pause the update loop when the hook unmounts.
   */
  useEffect(() => () => pause(), [pause]);

  return {
    start,
    pause,
    stop,
    isUpdating,
  };
};

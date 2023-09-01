import { act, renderHook } from "@testing-library/react";
import { beforeEach, afterEach, describe, expect, it, vi } from "vitest";
import { useUpdateLoop } from "./useUpdateLoop";

beforeEach(() => {
  vi.useFakeTimers();

  vi.spyOn(window, "requestAnimationFrame").mockImplementation(
    (callback: FrameRequestCallback): number => {
      /**
       * A timeout of `1000 / 50` is used to simulate a display with a 50Hz
       * refresh rate. This value was chosen because it results in a timeout
       * that is an integer value, which makes the number of frames easier to
       * calculate.
       */
      setTimeout(callback, 1000 / 50);
      return Math.random();
    },
  );

  vi.spyOn(window, "cancelAnimationFrame").mockImplementation(
    (id: number): void => {
      clearTimeout(id);
      vi.clearAllTimers();
    },
  );
});

afterEach(() => {
  vi.runOnlyPendingTimers();
  vi.useRealTimers();
  vi.restoreAllMocks();
});

describe("useUpdateLoop", () => {
  it("should call the onUpdate callback on each frame", () => {
    const onUpdate = vi.fn();

    renderHook(() => useUpdateLoop({ onUpdate, immediately: true }));

    vi.advanceTimersByTime(1000);

    expect(onUpdate).toHaveBeenCalledTimes(50);
  });

  it("should support starting the loop manually", () => {
    const onUpdate = vi.fn();

    const { result } = renderHook(() =>
      useUpdateLoop({
        onUpdate,
        immediately: false,
      }),
    );

    vi.advanceTimersByTime(500);

    expect(onUpdate).toHaveBeenCalledTimes(0);

    act(() => {
      result.current.start();
    });

    vi.advanceTimersByTime(500);

    expect(onUpdate).toHaveBeenCalledTimes(25);
  });

  it("should call the onUpdate callback with the correct frame data", () => {
    const onUpdate = vi.fn();

    renderHook(() => useUpdateLoop({ onUpdate, immediately: true }));

    vi.advanceTimersByTime(1000);

    expect(onUpdate).toHaveBeenLastCalledWith(
      expect.objectContaining({
        index: 49,
        time: 1000,
        deltaTime: 20,
        fps: 50,
      }),
    );
  });

  it("should not call the onUpdate callback when the loop is paused", () => {
    const onUpdate = vi.fn();

    const { result } = renderHook(() =>
      useUpdateLoop({ onUpdate, immediately: true }),
    );

    vi.advanceTimersByTime(500);

    expect(onUpdate).toHaveBeenCalledTimes(25);

    act(() => {
      result.current.pause();
    });

    vi.advanceTimersByTime(500);

    expect(onUpdate).toHaveBeenCalledTimes(25);
  });

  it("should return the correct value for isUpdating", () => {
    const onUpdate = vi.fn();

    const { result } = renderHook(() =>
      useUpdateLoop({ onUpdate, immediately: false }),
    );

    expect(result.current.isUpdating).toBe(false);

    act(() => {
      result.current.start();
    });

    expect(result.current.isUpdating).toBe(true);

    act(() => {
      result.current.pause();
    });

    expect(result.current.isUpdating).toBe(false);

    act(() => {
      result.current.start();
    });

    expect(result.current.isUpdating).toBe(true);

    act(() => {
      result.current.stop();
    });

    expect(result.current.isUpdating).toBe(false);
  });

  it("should not call the onUpdate callback when the loop is stopped", () => {
    const onUpdate = vi.fn();

    const { result } = renderHook(() =>
      useUpdateLoop({ onUpdate, immediately: true }),
    );

    vi.advanceTimersByTime(500);

    expect(onUpdate).toHaveBeenCalledTimes(25);

    act(() => {
      result.current.stop();
    });

    vi.advanceTimersByTime(500);

    expect(onUpdate).toHaveBeenCalledTimes(25);
  });

  it("should reset the frame count when the loop is restarted", () => {
    const onUpdate = vi.fn();

    const { result } = renderHook(() =>
      useUpdateLoop({ onUpdate, immediately: true }),
    );

    vi.advanceTimersByTime(500);

    expect(onUpdate).toHaveBeenCalledTimes(25);

    act(() => {
      result.current.stop();
    });

    act(() => {
      result.current.start();
    });

    vi.advanceTimersByTime(500);

    expect(onUpdate).toHaveBeenCalledTimes(50);

    expect(onUpdate).toHaveBeenLastCalledWith(
      expect.objectContaining({
        index: 24,
        time: 500,
        deltaTime: 20,
        fps: 50,
      }),
    );
  });

  it("should support a custom timeScale", () => {
    const onUpdate = vi.fn();

    renderHook(() =>
      useUpdateLoop({
        onUpdate,
        timeScale: 2,
        immediately: true,
      }),
    );

    vi.advanceTimersByTime(1000);

    expect(onUpdate).toHaveBeenCalledTimes(50);

    expect(onUpdate).toHaveBeenLastCalledWith(
      expect.objectContaining({
        index: 49,
        time: 2000,
        deltaTime: 40,
        fps: 50,
      }),
    );
  });

  it("should support a targetFps", () => {
    const onUpdate = vi.fn();

    renderHook(() =>
      useUpdateLoop({
        onUpdate,
        targetFps: 25,
        immediately: true,
      }),
    );

    vi.advanceTimersByTime(1000);

    expect(onUpdate).toHaveBeenCalledTimes(25);

    expect(onUpdate).toHaveBeenLastCalledWith(
      expect.objectContaining({
        index: 24,
        time: 980, // Because the last step does not result in an update.
        deltaTime: 40,
        fps: 25,
      }),
    );
  });

  it("should support changing the callback", () => {
    const onUpdate1 = vi.fn();
    const onUpdate2 = vi.fn();

    const { rerender } = renderHook(
      ({ onUpdate }) =>
        useUpdateLoop({
          onUpdate,
          immediately: true,
        }),
      {
        initialProps: { onUpdate: onUpdate1 },
      },
    );

    vi.advanceTimersByTime(500);

    expect(onUpdate1).toHaveBeenCalledTimes(25);

    rerender({ onUpdate: onUpdate2 });

    vi.advanceTimersByTime(500);

    expect(onUpdate1).toHaveBeenCalledTimes(25);
    expect(onUpdate2).toHaveBeenCalledTimes(25);
  });
});

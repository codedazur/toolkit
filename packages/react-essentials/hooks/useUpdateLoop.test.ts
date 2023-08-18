import { act, renderHook } from "@testing-library/react";
import {
  beforeAll,
  afterEach,
  afterAll,
  describe,
  expect,
  it,
  vi,
} from "vitest";
import { useUpdateLoop } from "./useUpdateLoop";

beforeAll(() => {
  vi.useFakeTimers();

  vi.spyOn(window, "requestAnimationFrame").mockImplementation(
    (callback: FrameRequestCallback): number => {
      /**
       * Using a timeout of 0 simulates a display with an infinite refresh rate,
       * allowing us to test any targetFps option, which would otherwise be
       * limited by the refresh rate of the display. A timeout is still needed
       * to ensure that the callback is not called synchronously, which would
       * cause an infinite loop.
       */
      setTimeout(callback, 0);

      return Math.random();
    },
  );
});

afterEach(() => {
  vi.clearAllTimers();
});

afterAll(() => {
  vi.useRealTimers();
  vi.restoreAllMocks();
});

describe("useUpdateLoop", () => {
  it("should support starting the loop immediately", () => {
    const onUpdate = vi.fn();

    renderHook(() =>
      useUpdateLoop({
        onUpdate,
        timeScale: 1,
        targetFps: 60,
        immediately: true,
      }),
    );

    vi.advanceTimersByTime(1000);

    expect(onUpdate).toHaveBeenCalledTimes(60);
  });

  it("should support starting the loop later", () => {
    const onUpdate = vi.fn();

    const { result } = renderHook(() =>
      useUpdateLoop({
        onUpdate,
        timeScale: 1,
        targetFps: 60,
        immediately: false,
      }),
    );

    vi.advanceTimersByTime(500);

    expect(onUpdate).toHaveBeenCalledTimes(0);

    act(() => {
      result.current.start();
    });

    vi.advanceTimersByTime(500);

    expect(onUpdate).toHaveBeenCalledTimes(30);
  });

  it("should not call the onUpdate callback when the loop is stopped", () => {
    const onUpdate = vi.fn();

    const { result } = renderHook(() =>
      useUpdateLoop({
        onUpdate,
        timeScale: 1,
        targetFps: 60,
        immediately: true,
      }),
    );

    vi.advanceTimersByTime(500);

    expect(onUpdate).toHaveBeenCalledTimes(30);

    act(() => {
      result.current.stop();
    });

    vi.advanceTimersByTime(500);

    expect(onUpdate).toHaveBeenCalledTimes(30);
  });

  it("should not call the onUpdate callback when the loop is paused", () => {
    const onUpdate = vi.fn();

    const { result } = renderHook(() =>
      useUpdateLoop({
        onUpdate,
        timeScale: 1,
        targetFps: 60,
        immediately: true,
      }),
    );

    vi.advanceTimersByTime(500);

    expect(onUpdate).toHaveBeenCalledTimes(30);

    act(() => {
      result.current.pause();
    });

    vi.advanceTimersByTime(500);

    expect(onUpdate).toHaveBeenCalledTimes(30);
  });

  it("should call the onUpdate callback on each frame", () => {
    const onUpdate = vi.fn();

    renderHook(() =>
      useUpdateLoop({
        onUpdate,
        timeScale: 1,
        targetFps: 60,
        immediately: true,
      }),
    );

    vi.advanceTimersByTime(1000);

    expect(onUpdate).toHaveBeenCalledTimes(60);
  });

  it("should call the onUpdate callback with the correct frame data", () => {
    const onUpdate = vi.fn();

    renderHook(() =>
      useUpdateLoop({
        onUpdate,
        timeScale: 1,
        targetFps: 60,
        immediately: true,
      }),
    );

    vi.advanceTimersByTime(1000);

    expect(onUpdate).toHaveBeenLastCalledWith(
      expect.objectContaining({
        index: 59,
        time: 1000,
        deltaTime: 16.666666666666668,
        fps: 60,
      }),
    );
  });

  it("should reset the frame count when the loop is restarted", () => {
    const onUpdate = vi.fn();

    const { result } = renderHook(() =>
      useUpdateLoop({
        onUpdate,
        timeScale: 1,
        targetFps: 60,
        immediately: true,
      }),
    );

    vi.advanceTimersByTime(500);

    expect(onUpdate).toHaveBeenCalledTimes(30);

    act(() => {
      result.current.stop();
    });

    vi.advanceTimersByTime(500);

    expect(onUpdate).toHaveBeenCalledTimes(30);

    act(() => {
      result.current.start();
    });

    vi.advanceTimersByTime(500);

    expect(onUpdate).toHaveBeenCalledTimes(60);

    expect(onUpdate).toHaveBeenLastCalledWith(
      expect.objectContaining({
        index: 59,
        time: 1000,
        deltaTime: 16.666666666666668,
        fps: 60,
      }),
    );
  });

  it("should take the timescale into account for the time and deltaTime, without affecting the number of frames and callback calls", () => {
    const onUpdate = vi.fn();

    renderHook(() =>
      useUpdateLoop({
        onUpdate,
        timeScale: 2,
        targetFps: 60,
        immediately: true,
      }),
    );

    vi.advanceTimersByTime(1000);

    expect(onUpdate).toHaveBeenCalledTimes(60);

    expect(onUpdate).toHaveBeenLastCalledWith(
      expect.objectContaining({
        index: 59,
        time: 2000,
        deltaTime: 33.333333333333336,
        fps: 60,
      }),
    );
  });

  it("should take the targetFps into account for the fps and callback calls, without affecting the time and deltaTime", () => {
    const onUpdate = vi.fn();

    renderHook(() =>
      useUpdateLoop({
        onUpdate,
        timeScale: 1,
        targetFps: 30,
        immediately: true,
      }),
    );

    vi.advanceTimersByTime(1000);

    expect(onUpdate).toHaveBeenCalledTimes(30);

    expect(onUpdate).toHaveBeenLastCalledWith(
      expect.objectContaining({
        index: 29,
        time: 1000,
        deltaTime: 16.666666666666668,
        fps: 30,
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
          timeScale: 1,
          targetFps: 60,
          immediately: true,
        }),
      {
        initialProps: { onUpdate: onUpdate1 },
      },
    );

    vi.advanceTimersByTime(500);

    expect(onUpdate1).toHaveBeenCalledTimes(60);

    rerender({ onUpdate: onUpdate2 });

    vi.advanceTimersByTime(500);

    expect(onUpdate1).toHaveBeenCalledTimes(30);
    expect(onUpdate2).toHaveBeenCalledTimes(30);
  });
});

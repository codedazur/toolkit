import { Timer, TimerEvent, TimerStatus } from "./Timer";
import { describe, it, expect, vi, Mock, beforeEach, afterEach } from "vitest";

describe("Timer", () => {
  vi.useFakeTimers();

  let callback: Mock;
  let timer: Timer;

  beforeEach(() => {
    callback = vi.fn();
    timer = new Timer(callback, 5000);
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.clearAllMocks();
    vi.useRealTimers();
  });

  describe("Initialization", () => {
    it("should initialize with the correct duration and remaining time", () => {
      expect(timer.duration).toBe(5000);
      expect(timer.remaining).toBe(5000);
    });

    it("should be in the stopped status", () => {
      expect(timer.status).toBe(TimerStatus.stopped);
      expect(timer.isStopped).toBe(true);
      expect(timer.isRunning).toBe(false);
      expect(timer.isPaused).toBe(false);
    });
  });

  describe("Start", () => {
    it("should start the timer and call the callback when finished", () => {
      timer.start();

      expect(timer.status).toBe(TimerStatus.running);
      expect(timer.isRunning).toBe(true);
      expect(timer.isStopped).toBe(false);
      expect(timer.isPaused).toBe(false);

      vi.advanceTimersByTime(5000);

      expect(callback).toHaveBeenCalled();
      expect(timer.status).toBe(TimerStatus.stopped);
    });

    it("should emit the 'start' event when the timer starts", () => {
      const eventHandler = vi.fn();
      timer.addEventListener(TimerEvent.start, eventHandler);

      timer.start();

      expect(eventHandler).toHaveBeenCalled();
    });
  });

  describe("Stop", () => {
    it("should stop the timer and reset its state", () => {
      timer.start();
      timer.stop();

      expect(timer.status).toBe(TimerStatus.stopped);
      expect(timer.isStopped).toBe(true);
      expect(timer.isRunning).toBe(false);
      expect(timer.isPaused).toBe(false);
    });

    it("should emit the 'stop' event when the timer stops", () => {
      const eventHandler = vi.fn();
      timer.addEventListener(TimerEvent.stop, eventHandler);

      timer.stop();

      expect(eventHandler).toHaveBeenCalled();
    });
  });

  describe("Pause", () => {
    it("should pause the running timer and resume the remaining time", () => {
      timer.start();
      vi.advanceTimersByTime(2000);
      timer.pause();

      expect(timer.status).toBe(TimerStatus.paused);
      expect(timer.isPaused).toBe(true);
      expect(timer.isRunning).toBe(false);
      expect(callback).not.toHaveBeenCalled();
      expect(timer.remaining).toBe(3000);
    });

    it("should emit the 'pause' event when the timer is paused", () => {
      const eventHandler = vi.fn();
      timer.addEventListener(TimerEvent.pause, eventHandler);

      timer.start();
      timer.pause();

      expect(eventHandler).toHaveBeenCalled();
    });
  });

  describe("Resume", () => {
    it("should resume the paused timer and continue counting down", () => {
      timer.start();
      timer.pause();
      timer.resume();

      expect(timer.status).toBe(TimerStatus.running);
      expect(timer.isRunning).toBe(true);
      expect(timer.isPaused).toBe(false);

      vi.advanceTimersByTime(3000);

      expect(callback).not.toHaveBeenCalled();
      expect(timer.status).toBe(TimerStatus.running);
      expect(timer.remaining).toBe(2000);

      vi.advanceTimersByTime(2000);

      expect(callback).toHaveBeenCalled();
      expect(timer.status).toBe(TimerStatus.stopped);
    });

    it("should start the timer if it's not running or paused", () => {
      expect(timer.status).toBe(TimerStatus.stopped);

      timer.resume();

      expect(timer.status).toBe(TimerStatus.running);
      expect(timer.isRunning).toBe(true);
      expect(timer.isPaused).toBe(false);
    });

    it("should emit the 'resume' event when the timer resumes", () => {
      const eventHandler = vi.fn();
      timer.addEventListener(TimerEvent.resume, eventHandler);

      timer.start();
      timer.pause();
      timer.resume();

      expect(eventHandler).toHaveBeenCalled();
    });
  });

  describe("Extend", () => {
    it("should extend the timer duration and update the remaining time", () => {
      timer.start();
      timer.extend(2000);

      expect(timer.duration).toBe(7000);
      expect(timer.remaining).toBe(7000);

      vi.advanceTimersByTime(5000);

      expect(timer.status).toBe(TimerStatus.running);
      expect(callback).not.toHaveBeenCalled();
    });

    it("should extend the timer duration abd update the remaining time when paused", () => {
      timer.start();
      timer.pause();
      timer.extend(2000);

      expect(timer.duration).toBe(7000);
      expect(timer.remaining).toBe(7000);
    });

    it("should emit the 'extend' event when the timer is extended", () => {
      const eventHandler = vi.fn();
      timer.addEventListener(TimerEvent.extend, eventHandler);

      timer.extend(2000);

      expect(eventHandler).toHaveBeenCalled();
    });
  });

  describe("Event Listeners", () => {
    it("should call the registered event listeners when an event occurs", () => {
      const startHandler = vi.fn();
      const stopHandler = vi.fn();

      timer.addEventListener(TimerEvent.start, startHandler);
      timer.addEventListener(TimerEvent.stop, stopHandler);

      timer.start();
      timer.stop();

      expect(startHandler).toHaveBeenCalled();
      expect(stopHandler).toHaveBeenCalled();
    });

    it("should remove event listeners when requested", () => {
      const eventHandler = vi.fn();

      timer.addEventListener(TimerEvent.start, eventHandler);
      timer.start();

      expect(eventHandler).toHaveBeenCalledTimes(1);

      timer.removeEventListener(TimerEvent.start, eventHandler);
      timer.start();

      expect(eventHandler).toHaveBeenCalledTimes(1);
    });
  });
});

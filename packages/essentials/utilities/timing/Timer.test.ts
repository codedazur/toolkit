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
    it("should throw an error when duration is less then 0", () => {
      expect(() => new Timer(callback, -2000)).toThrow(
        new Error("Duration cannot be less then 0.")
      );
    });

    it("should initialize with the correct status and remaining time when duration is 0", () => {
      const timer = new Timer(callback, 0);
      expect(timer.duration).toBe(0);
      expect(timer.remaining).toBe(0);
      expect(timer.status).toBe(TimerStatus.stopped);
    });

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
      expect(timer.status).toBe(TimerStatus.completed);
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

    /**
     * @todo This test needs to be fixed and enabled.
     */
    it.skip("should emit the 'stop' event when the timer stops", () => {
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
      expect(timer.status).toBe(TimerStatus.completed);
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

  describe("Set duration", () => {
    it("should change the timer duration and update the remaining time", () => {
      timer.start();
      timer.setDuration(2000);

      expect(timer.progress).toBe(0);
      expect(timer.duration).toBe(2000);
      expect(timer.remaining).toBe(2000);
      expect(timer.status).toBe(TimerStatus.running);
      expect(callback).not.toHaveBeenCalled();

      vi.advanceTimersByTime(2000);

      expect(timer.status).toBe(TimerStatus.completed);
      expect(callback).toHaveBeenCalled();
    });

    it("should update the timer duration and update the remaining time when paused", () => {
      timer.start();
      timer.pause();
      timer.setDuration(7000);

      expect(timer.duration).toBe(7000);
      expect(timer.remaining).toBe(7000);
    });

    it("should extend a completed timer duration and show correct status", () => {
      timer.start();
      vi.advanceTimersByTime(5000);

      expect(timer.status).toBe(TimerStatus.completed);

      timer.setDuration(8000);

      expect(timer.status).toBe(TimerStatus.paused);

      vi.advanceTimersByTime(8000);

      expect(timer.status).toBe(TimerStatus.paused);

      timer.resume();

      expect(timer.status).toBe(TimerStatus.running);

      vi.advanceTimersByTime(5000);

      expect(timer.status).toBe(TimerStatus.completed);
    });

    it("should extend a completed timer duration and show correct data", () => {
      const eventHandler = vi.fn();
      timer.addEventListener(TimerEvent.end, eventHandler);
      timer.start();
      vi.advanceTimersByTime(5000);
      timer.setDuration(8000);

      expect(timer.remaining).toBe(3000);
      expect(timer.progress).toBe(0.625);
      expect(timer.elapsed).toBe(5000);

      vi.advanceTimersByTime(8000);

      expect(eventHandler).toHaveBeenCalledTimes(1);

      timer.resume();

      vi.advanceTimersByTime(5000);
      expect(eventHandler).toHaveBeenCalledTimes(2);
    });

    it("should emit the 'changeDuration' event when the timer duration is changed", () => {
      const eventHandler = vi.fn();
      timer.addEventListener(TimerEvent.changeDuration, eventHandler);

      timer.setDuration(7000);

      expect(eventHandler).toHaveBeenCalled();
    });

    it("should complete a running timer when duration is set to 0", () => {
      timer.setDuration(0);

      expect(timer.progress).toBe(0);
      expect(timer.duration).toBe(0);
      expect(timer.remaining).toBe(0);
      expect(timer.status).toBe(TimerStatus.stopped);
      expect(callback).not.toHaveBeenCalled();

      timer.start();
      vi.advanceTimersByTime(0);

      expect(timer.progress).toBe(1);
      expect(timer.duration).toBe(0);
      expect(timer.remaining).toBe(0);
      expect(timer.status).toBe(TimerStatus.completed);
      expect(callback).toHaveBeenCalled();
    });

    it("should throw an error when duration is less then 0", () => {
      expect(() => timer.setDuration(-1000)).toThrow(
        new Error("Duration cannot be less then 0.")
      );
    });

    it("should complete a running timer when duration is set to less then the remaining time", () => {
      timer.start();
      vi.advanceTimersByTime(2000);
      timer.setDuration(2000);

      expect(timer.status).toBe(TimerStatus.completed);
    });

    it("should not complete a paused timer when duration is set to less then the remaining time", () => {
      timer.start();
      vi.advanceTimersByTime(2000);
      timer.pause();

      expect(timer.status).toBe(TimerStatus.paused);

      timer.setDuration(2000);

      expect(timer.status).toBe(TimerStatus.paused);
    });

    it("should not change a timer when duration is set to the initial duration", () => {
      timer.start();
      vi.advanceTimersByTime(2500);
      timer.setDuration(5000);

      expect(timer.status).toBe(TimerStatus.running);

      vi.advanceTimersByTime(2500);

      expect(timer.remaining).toBe(0);
      expect(timer.status).toBe(TimerStatus.completed);
      expect(callback).toHaveBeenCalled();
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

    it("should extend the timer duration and update the remaining time when paused", () => {
      timer.start();
      timer.pause();
      timer.extend(2000);

      expect(timer.duration).toBe(7000);
      expect(timer.remaining).toBe(7000);
    });

    it("should emit the 'changeDuration' event when the timer is extended", () => {
      const eventHandler = vi.fn();
      timer.addEventListener(TimerEvent.changeDuration, eventHandler);

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

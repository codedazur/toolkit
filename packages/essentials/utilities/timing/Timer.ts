import { clamp } from "../math/clamp";

type TimerEvent = "start" | "stop" | "resume" | "pause" | "extend";

export class Timer {
  private id?: number;
  private callback: () => void;
  private _duration: number;
  private _startedAt?: number;
  private _shiftedStartedAt?: number;
  private _timeoutStartedAt?: number;
  private _pausedAt?: number;
  private _remaining: number;

  private eventListeners: Record<TimerEvent, Array<() => void>> = {
    start: [],
    stop: [],
    resume: [],
    pause: [],
    extend: [],
  };

  constructor(callback: () => void, duration: number) {
    this.callback = callback;
    this._duration = duration;
    this._remaining = duration;
  }

  public get duration(): number {
    return this._duration;
  }

  public get startedAt(): number | undefined {
    return this._startedAt;
  }

  public get progress(): number {
    return clamp(
      this.isRunning()
        ? (Date.now() - this._shiftedStartedAt!) / this._duration
        : 1 - this._remaining / this._duration,
      0,
      1
    );
  }

  public get elapsed(): number {
    return this.progress * this.duration;
  }

  public get remaining(): number {
    return this.duration - this.elapsed;
  }

  private hasTimeout = (): boolean => !!this.id;

  private clearTimeout = (): void => {
    if (!this.hasTimeout()) {
      return;
    }

    window.clearTimeout(this.id);
    this.id = undefined;

    this.runEventListeners("pause");
  };

  private setTimeout = (): void => {
    if (this.hasTimeout()) {
      throw new Error(
        "Cannot start a new timeout while a timeout is still running."
      );
    }

    this.id = window.setTimeout(() => {
      this.reset();
      this.callback();
    }, this._remaining);

    this._timeoutStartedAt = Date.now();

    this.runEventListeners("resume");
  };

  private reset = (): void => {
    this.clearTimeout();

    this._startedAt = this._shiftedStartedAt = Date.now();
    this._pausedAt = undefined;
    this._remaining = this._duration;
  };

  private runEventListeners = (event: TimerEvent): void => {
    this.eventListeners[event].forEach((handler) => handler());
  };

  public addEventListener = (event: TimerEvent, handler: () => void): void => {
    this.eventListeners[event].push(handler);
  };

  public removeEventListener = (
    event: TimerEvent,
    handler: () => void
  ): void => {
    this.eventListeners[event] = this.eventListeners[event].filter(
      (entry) => entry !== handler
    );
  };

  public isRunning = (): boolean => this.hasTimeout();

  public isPaused = (): boolean => !this.hasTimeout();

  public start = (): void => {
    this.reset();
    this.setTimeout();
    this.runEventListeners("start");
  };

  public stop = () => {
    this.reset();
    this.runEventListeners("stop");
  };

  public pause = (): void => {
    if (this.isPaused()) {
      return;
    }

    this.clearTimeout();

    this._pausedAt = Date.now();
    this._remaining -= Date.now() - this._timeoutStartedAt!;
  };

  public resume = (): void => {
    if (this.isRunning()) {
      return;
    }

    if (!this._pausedAt) {
      return this.start();
    }

    this._shiftedStartedAt! += Date.now() - this._pausedAt;
    this._pausedAt = undefined;

    this.setTimeout();
  };

  public extend = (by: number): void => {
    const wasRunning = this.isRunning();

    this.pause();
    this._duration += by;
    this._remaining += by;

    if (wasRunning) {
      this.resume();
    }

    this.runEventListeners("extend");
  };
}

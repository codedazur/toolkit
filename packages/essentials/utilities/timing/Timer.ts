import { clamp } from "../math/clamp";

export enum TimerEvent {
  start = "start",
  stop = "stop",
  pause = "pause",
  resume = "resume",
  extend = "extend",
  end = "end",
}

export enum TimerStatus {
  stopped = "stopped",
  running = "running",
  paused = "paused",
}

export class Timer {
  private _timeout?: number | NodeJS.Timeout;
  private _callback: () => void;
  private _duration: number;
  private _startedAt?: number;
  private _shiftedStartedAt?: number;
  private _timeoutStartedAt?: number;
  private _pausedAt?: number;
  private _remaining: number;

  private _eventListeners: Record<TimerEvent, Array<() => void>> = {
    start: [],
    stop: [],
    pause: [],
    resume: [],
    extend: [],
    end: [],
  };

  constructor(callback: () => void, duration: number) {
    this._callback = callback;
    this._duration = duration;
    this._remaining = duration;
  }

  private get _hasTimeout(): boolean {
    return !!this._timeout;
  }

  public get status(): TimerStatus {
    return this._hasTimeout
      ? TimerStatus.running
      : this._remaining < this._duration
      ? TimerStatus.paused
      : TimerStatus.stopped;
  }

  public get isRunning(): boolean {
    return this.status === TimerStatus.running;
  }

  public get isPaused(): boolean {
    return this.status === TimerStatus.paused;
  }

  public get isStopped(): boolean {
    return this.status === TimerStatus.stopped;
  }

  public get duration(): number {
    return this._duration;
  }

  public get startedAt(): number | undefined {
    return this._startedAt;
  }

  public get progress(): number {
    return clamp(
      this.isRunning
        ? (Date.now() - this._shiftedStartedAt!) / this._duration
        : 1 - this._remaining / this._duration,
      0,
      1
    );
  }

  public get elapsed(): number {
    return Math.round(this.progress * this.duration);
  }

  public get remaining(): number {
    return this.duration - this.elapsed;
  }

  private _clearTimeout = (): void => {
    if (!this._hasTimeout) {
      return;
    }

    clearTimeout(this._timeout);
    this._timeout = undefined;
  };

  private _setTimeout = (): void => {
    if (this._hasTimeout) {
      throw new Error(
        "Cannot start a new timeout while a timeout is still running."
      );
    }

    this._timeout = setTimeout(this.end, this._remaining);

    this._timeoutStartedAt = Date.now();
  };

  private _reset = (): void => {
    this._clearTimeout();

    this._startedAt = this._shiftedStartedAt = undefined;
    this._pausedAt = undefined;
    this._remaining = this._duration;
  };

  private _runEventListeners = (event: TimerEvent): void => {
    this._eventListeners[event].forEach((handler) => handler());
  };

  public addEventListener = (event: TimerEvent, handler: () => void): void => {
    this._eventListeners[event].push(handler);
  };

  public removeEventListener = (
    event: TimerEvent,
    handler: () => void
  ): void => {
    this._eventListeners[event] = this._eventListeners[event].filter(
      (entry) => entry !== handler
    );
  };

  public start = (): void => {
    if (this.isRunning) {
      return;
    }

    this._reset();
    this._startedAt = this._shiftedStartedAt = Date.now();
    this._setTimeout();
    this._runEventListeners(TimerEvent.start);
  };

  public stop = () => {
    if (this.isStopped) {
      return;
    }

    this._reset();
    this._runEventListeners(TimerEvent.stop);
  };

  public pause = (): void => {
    if (!this.isRunning) {
      return;
    }

    this._clearTimeout();

    this._pausedAt = Date.now();
    this._remaining -= Date.now() - this._timeoutStartedAt!;

    this._runEventListeners(TimerEvent.pause);
  };

  public resume = (): void => {
    if (this.isRunning) {
      return;
    }

    if (!this._pausedAt) {
      return this.start();
    }

    this._shiftedStartedAt! += Date.now() - this._pausedAt;
    this._pausedAt = undefined;

    this._setTimeout();

    this._runEventListeners(TimerEvent.resume);
  };

  public extend = (by: number): void => {
    const wasRunning = this.isRunning;

    this.pause();
    this._duration += by;
    this._remaining += by;

    if (wasRunning) {
      this.resume();
    }

    this._runEventListeners(TimerEvent.extend);
  };

  public end = (): void => {
    this._reset();
    this._runEventListeners(TimerEvent.end);

    this._callback();
  };
}

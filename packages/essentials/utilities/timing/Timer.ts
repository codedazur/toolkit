import { clamp } from "../math/clamp";

export enum TimerEvent {
  start = "start",
  stop = "stop",
  pause = "pause",
  resume = "resume",
  changeDuration = "changeDuration",
  end = "end",
}

export enum TimerStatus {
  stopped = "stopped",
  running = "running",
  paused = "paused",
  completed = "completed",
}

export class Timer {
  private _timeout?: number | NodeJS.Timeout;
  private _callback: () => void;
  private _duration: number;
  private _startedAt?: number;
  private _shiftedStartedAt?: number;
  private _timeoutStartedAt?: number;
  private _pausedAt?: number;
  private _completedAt?: number;
  private _remaining: number;

  private _eventListeners: Record<TimerEvent, Array<() => void>> = {
    start: [],
    stop: [],
    pause: [],
    resume: [],
    changeDuration: [],
    end: [],
  };

  constructor(callback: () => void, duration: number) {
    if (duration < 0) {
      throw new Error("Duration cannot be less then 0.");
    }

    this._callback = callback;
    this._duration = duration;
    this._remaining = duration;
  }

  private get _hasTimeout(): boolean {
    return !!this._timeout;
  }

  public get status(): TimerStatus {
    if (this._hasTimeout) {
      return TimerStatus.running;
    } else if (this._remaining === 0 && this._completedAt) {
      return TimerStatus.completed;
    } else if (this._remaining < this._duration) {
      return TimerStatus.paused;
    } else {
      return TimerStatus.stopped;
    }
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

  public get isCompleted(): boolean {
    return this.status === TimerStatus.completed;
  }

  public get duration(): number {
    return this._duration;
  }

  public get startedAt(): number | undefined {
    return this._startedAt;
  }

  public get progress(): number {
    if (this.isCompleted) {
      return 1;
    }

    const progress = clamp(
      this.isRunning
        ? (Date.now() - this._shiftedStartedAt!) / this._duration
        : 1 - this._remaining / this._duration,
      0,
      1
    );

    return progress || 0;
  }

  public get elapsed(): number {
    return Math.round(this.progress * this.duration);
  }

  public get remaining(): number {
    return this._duration - this.elapsed;
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
    this._completedAt = undefined;
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
    if (this.isRunning || this.isCompleted) {
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

  public setDuration = (duration: number): void => {
    const wasRunning = this.isRunning;

    if (duration < 0) {
      throw new Error("Duration cannot be less then 0.");
    }

    if (duration === this.duration) {
      return;
    }

    if (wasRunning && this.elapsed >= duration) {
      this.end();
      return;
    }

    if (this.isCompleted) {
      this._pausedAt = this._completedAt;
      this._completedAt = undefined;
    }

    this._clearTimeout();
    this._remaining = duration - (this.elapsed || 0);
    this._duration = duration;

    if (wasRunning) {
      this._setTimeout();
    }

    this._runEventListeners(TimerEvent.changeDuration);
  };

  public extend = (by: number): void => {
    this.setDuration(this.duration + by);
  };

  public end = (): void => {
    this._clearTimeout();

    this._completedAt = Date.now();
    this._pausedAt = undefined;
    this._remaining = 0;

    this._runEventListeners(TimerEvent.end);
    this._callback();
  };
}

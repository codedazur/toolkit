export class Timer {
  private id?: number;
  private callback: () => void;
  private _delay: number;
  private _startedAt: number;
  private _remaining: number;

  private pauseHandlers: Record<string, () => void> = {};
  private resumeHandlers: Record<string, () => void> = {};

  constructor(callback: () => void, delay: number) {
    this.callback = callback;
    this._delay = delay;
    this._remaining = delay;
    this._startedAt = Date.now();
  }

  public get delay(): number {
    return this._delay;
  }

  public get remaining(): number {
    return this._remaining;
  }

  public get startedAt(): number {
    return this._startedAt;
  }

  public get progress(): number {
    return (Date.now() - this.startedAt) / this.delay;
  }

  public start(): void {
    this._remaining = this.delay;
    this.resume();
  }

  public pause(): void {
    window.clearTimeout(this.id);
    this.id = undefined;
    this._remaining -= Date.now() - this.startedAt;
    Object.values(this.pauseHandlers).forEach((handler) => handler());
  }

  public onPause(callback: () => void): () => void {
    return this.addHandler(this.pauseHandlers, callback);
  }

  public resume(): void {
    this._startedAt = Date.now();
    window.clearTimeout(this.id);
    this.id = window.setTimeout(this.callback, this.remaining);
    Object.values(this.resumeHandlers).forEach((handler) => handler());
  }

  public onResume(callback: () => void): () => void {
    return this.addHandler(this.resumeHandlers, callback);
  }

  public stop(): void {
    this.pause();
    this._remaining = 0;
  }

  public reset(): void {
    this.stop();
    this.start();
  }

  public extend(delay: number): void {
    this._delay = this.remaining + delay;
    this.start();
  }

  private addHandler(
    handlers: Record<string, () => void>,
    handler: () => void
  ): () => void {
    const id = Date.now();

    handlers[id] = handler;

    return () => {
      delete handlers[id];
    };
  }
}

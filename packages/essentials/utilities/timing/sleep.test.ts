import {
  afterAll,
  afterEach,
  beforeAll,
  describe,
  expect,
  it,
  vi,
} from "vitest";
import { sleep } from "./sleep";

beforeAll(() => {
  vi.useFakeTimers();
});

afterEach(() => {
  vi.clearAllTimers();
});

afterAll(() => {
  vi.useRealTimers();
});

describe("sleep", () => {
  it("should wait for the specified time", async () => {
    const callback = vi.fn();
    sleep(1000).then(callback);

    expect(callback).not.toHaveBeenCalled();

    await vi.advanceTimersByTimeAsync(500);
    expect(callback).not.toHaveBeenCalled();

    await vi.advanceTimersByTimeAsync(500);
    expect(callback).toHaveBeenCalled();
  });
});

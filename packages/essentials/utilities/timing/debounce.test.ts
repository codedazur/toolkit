import {
  afterAll,
  afterEach,
  beforeAll,
  describe,
  expect,
  it,
  vi,
} from "vitest";
import { debounce } from "./debounce";

beforeAll(() => {
  vi.useFakeTimers();
});

afterEach(() => {
  vi.clearAllTimers();
});

afterAll(() => {
  vi.useRealTimers();
});

describe("debounce", () => {
  it("should debounce the function", async () => {
    const callback = vi.fn();
    const [debounced] = debounce(callback, 100);

    debounced();
    debounced();

    expect(callback).not.toHaveBeenCalled();

    await vi.advanceTimersByTimeAsync(50);
    expect(callback).not.toHaveBeenCalled();

    await vi.advanceTimersByTimeAsync(50);
    expect(callback).toHaveBeenCalledOnce();
  });

  it("should support canceling the debounced function", async () => {
    const callback = vi.fn();
    const [debounced, cancel] = debounce(callback, 100);

    debounced();
    cancel();

    await vi.advanceTimersByTimeAsync(100);
    expect(callback).not.toHaveBeenCalled();
  });

  it("should support arguments", async () => {
    const callback = vi.fn();
    const [debounced] = debounce(callback, 100);

    debounced(1, 2, 3);

    await vi.advanceTimersByTimeAsync(100);
    expect(callback).toHaveBeenCalledWith(1, 2, 3);
  });

  it("should support return values", async () => {
    const [debounced] = debounce(() => 42, 100);

    let result;
    debounced().then((value) => (result = value));
    expect(result).toBe(undefined);

    await vi.advanceTimersByTimeAsync(100);
    expect(result).toBe(42);
  });
});

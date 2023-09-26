import { renderHook, act } from "@testing-library/react";
import { usePrevious } from "./usePrevious";
import { describe, it, expect } from "vitest";

describe("usePrevious", () => {
  it("should return undefined for the first render", () => {
    const { result } = renderHook(() => usePrevious(0));

    expect(result.current).toBe(undefined);
  });

  it("should return the previous value after the value changes", () => {
    const { result, rerender } = renderHook((props) => usePrevious(props), {
      initialProps: "initial value",
    });

    expect(result.current).toBe(undefined);

    act(() => {
      rerender("first rerender value");
    });

    expect(result.current).toBe("initial value");

    act(() => {
      rerender("second rerender value");
    });

    expect(result.current).toBe("first rerender value");
  });
});

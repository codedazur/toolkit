import { renderHook } from "@testing-library/react";
import { useSynchronizedRef } from "./useSynchronizedRef";
import { describe, it, expect } from "vitest";

describe("useSynchronizedRef", () => {
  it("should return a ref with initial value", () => {
    const initialValue = "initial value";
    const { result } = renderHook(() => useSynchronizedRef(initialValue));
    expect(result.current.current).toEqual(initialValue);
  });

  it("should update ref when value changes", () => {
    const { result, rerender } = renderHook(
      (props) => useSynchronizedRef(props.value),
      {
        initialProps: { value: "initial value" },
      }
    );
    expect(result.current.current).toEqual("initial value");
    rerender({ value: "new value" });
    expect(result.current.current).toEqual("new value");
  });
});

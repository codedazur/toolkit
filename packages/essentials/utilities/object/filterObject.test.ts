import { describe, it, expect } from "vitest";
import { filterObject } from "./filterObject";

describe("filterObject", () => {
  it("filters an object", () => {
    expect(
      filterObject(
        { a: 1, b: 2, c: 3 },
        ([key, value]) => key === "a" || value === 3,
      ),
    ).toEqual({ a: 1, c: 3 });
  });
});

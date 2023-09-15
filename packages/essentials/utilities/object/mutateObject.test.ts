import { describe, it, expect } from "vitest";
import { mutateObject } from "./mutateObject";

const object = { a: 1, b: 2, c: 3 };

describe("mutateObject", () => {
  it("mutates an object", () => {
    expect(mutateObject(object, ([key, value]) => [value, key])).toEqual({
      1: "a",
      2: "b",
      3: "c",
    });
  });

  it("does not mutate the original object", () => {
    mutateObject(object, ([key, value]) => [value, key]);
    expect(object).toEqual({ a: 1, b: 2, c: 3 });
  });
});

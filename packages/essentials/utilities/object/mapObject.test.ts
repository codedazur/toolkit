import { describe, it, expect } from "vitest";
import { mapObject } from "./mapObject";

const object = { a: 1, b: 2, c: 3 };

describe("mapObject", () => {
  it("maps an object to an array", () => {
    expect(mapObject(object, ([key, value]) => `${key}:${value}`)).toEqual([
      "a:1",
      "b:2",
      "c:3",
    ]);
  });

  it("does not mutate the original object", () => {
    mapObject(object, ([key, value]) => `${key}${value}`);
    expect(object).toEqual({ a: 1, b: 2, c: 3 });
  });
});

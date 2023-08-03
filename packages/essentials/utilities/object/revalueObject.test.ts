import { describe, it, expect } from "vitest";
import { revalueObject } from "./revalueObject";

const object = { a: 1, b: 2, c: 3 };

describe("revalueObject", () => {
  it("revalues an object", () => {
    expect(revalueObject(object, ([key, value]) => `${key}${value}`)).toEqual({
      a: "a1",
      b: "b2",
      c: "c3",
    });
  });

  it("does not mutate the original object", () => {
    revalueObject(object, ([key, value]) => `${key}${value}`);
    expect(object).toEqual({ a: 1, b: 2, c: 3 });
  });
});

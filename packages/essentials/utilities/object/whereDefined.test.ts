import { describe, it, expect } from "vitest";
import { whereDefined } from "./whereDefined";

describe("whereDefined", () => {
  it("removes undefined properties", () => {
    expect(
      whereDefined({
        a: 0,
        b: "",
        c: false,
        d: null,
        e: undefined,
      }),
    ).toEqual({
      a: 0,
      b: "",
      c: false,
    });
  });
});

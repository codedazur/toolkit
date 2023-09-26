import { describe, expect, it } from "vitest";
import { deg2rad } from "./deg2rad";

describe("deg2rad", () => {
  it("should convert degrees to radians", () => {
    expect(deg2rad(360)).toBe(2 * Math.PI);
    expect(deg2rad(180)).toBe(Math.PI);
    expect(deg2rad(90)).toBe(Math.PI / 2);
    expect(deg2rad(45)).toBe(Math.PI / 4);
    expect(deg2rad(0)).toBe(0);
    expect(deg2rad(-45)).toBe(-Math.PI / 4);
  });
});

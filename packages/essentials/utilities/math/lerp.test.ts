import { describe, expect, it } from "vitest";
import { lerp } from "./lerp";

describe("lerp", () => {
  it("should interpolate between two numbers", () => {
    expect(lerp(0, 2, 0)).toBe(0);
    expect(lerp(0, 2, 0.25)).toBe(0.5);
    expect(lerp(0, 2, 0.5)).toBe(1);
    expect(lerp(0, 2, 0.75)).toBe(1.5);
    expect(lerp(0, 2, 1)).toBe(2);
  });

  it("should support t values outside the range [0, 1]", () => {
    expect(lerp(0, 2, -1)).toBe(-2);
    expect(lerp(0, 2, 2)).toBe(4);
  });

  it("should support a < b", () => {
    expect(lerp(0, 2, 0.25)).toBe(0.5);
  });

  it("should support a = b", () => {
    expect(lerp(1, 1, 0)).toBe(1);
    expect(lerp(1, 1, 0.5)).toBe(1);
    expect(lerp(1, 1, 1)).toBe(1);
  });

  it("should support a > b", () => {
    expect(lerp(2, 0, 0.25)).toBe(1.5);
  });

  it("should support negative values", () => {
    expect(lerp(-2, 2, 0.25)).toBe(-1);
    expect(lerp(2, -2, 0.25)).toBe(1);
    expect(lerp(-2, -3, 0.25)).toBe(-2.25);
    expect(lerp(-3, -2, 0.25)).toBe(-2.75);
  });
});

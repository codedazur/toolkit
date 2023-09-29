import { describe, expect, it } from "vitest";
import { modulo } from "./modulo";

describe("modulo", () => {
  it("should perform the modulo operation", () => {
    expect(modulo(5, 3)).toBe(2);
    expect(modulo(-5, -3)).toBe(-2);
    expect(modulo(-5, 3)).toBe(1);
    expect(modulo(5, -3)).toBe(-1);

    expect(modulo(0, 3)).toBe(0);
    expect(modulo(0, -3)).toBe(-0);

    expect(modulo(5, 0)).toBeNaN();
    expect(modulo(0, 0)).toBeNaN();
  });

  it("should be equivalent to the remainder operation when divisor and divident are of the same sign", () => {
    expect(modulo(5, 3)).toBe(5 % 3);
    expect(modulo(-5, -3)).toBe(-5 % -3);
  });

  it("should be distinct from the remainder operation when divisor and divident are not of the same sign", () => {
    expect(modulo(-5, 3)).not.toBe(-5 % 3);
    expect(modulo(5, -3)).not.toBe(5 % -3);
  });
});

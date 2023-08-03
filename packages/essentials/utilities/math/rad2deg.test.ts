import { describe, expect, it } from "vitest";
import { rad2deg } from "./rad2deg";

describe("rad2deg", () => {
  it("should convert radians to degrees", () => {
    expect(rad2deg(2 * Math.PI)).toBe(360);
    expect(rad2deg(Math.PI)).toBe(180);
    expect(rad2deg(Math.PI / 2)).toBe(90);
    expect(rad2deg(Math.PI / 4)).toBe(45);
    expect(rad2deg(0)).toBe(0);
    expect(rad2deg(-Math.PI / 4)).toBe(-45);
  });
});

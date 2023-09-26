import { describe, expect, it } from "vitest";
import { Angle } from "./Angle";

describe("Angle", () => {
  it("should convert radians to degrees", () => {
    const angle = new Angle(Math.PI);
    expect(angle.degrees).toBe(180);
  });

  it("should convert degrees to radians", () => {
    const angle = Angle.degrees(180);
    expect(angle.radians).toBe(Math.PI);
  });
});

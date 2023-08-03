import { describe, expect, it } from "vitest";
import { Angle } from "./Angle";
import { Vector2 } from "./Vector2";

const vector = new Vector2(1, 2);

describe("Vector", () => {
  it("supports construction", () => {
    expect(new Vector2(1, 2)).toEqual({ x: 1, y: 2 });
    expect(new Vector2(1)).toEqual({ x: 1, y: 1 });
  });

  it("supports addition", () => {
    expect(vector.add(new Vector2(3, 4))).toEqual(new Vector2(4, 6));
    expect(vector.add(3)).toEqual(new Vector2(4, 5));
  });

  it("supports subtraction", () => {
    expect(vector.subtract(new Vector2(3, 4))).toEqual(new Vector2(-2, -2));
    expect(vector.subtract(3)).toEqual(new Vector2(-2, -1));
  });

  it("supports multiplication", () => {
    expect(vector.multiply(new Vector2(3, 4))).toEqual(new Vector2(3, 8));
    expect(vector.multiply(3)).toEqual(new Vector2(3, 6));
  });

  it("supports division", () => {
    expect(vector.divide(new Vector2(3, 4))).toEqual(new Vector2(1 / 3, 0.5));
    expect(vector.divide(3)).toEqual(new Vector2(1 / 3, 2 / 3));
  });

  it("supports inversion", () => {
    expect(vector.invert()).toEqual(new Vector2(-1, -2));
  });

  it("exposes the magnitude", () => {
    expect(new Vector2(-3, -4).magnitude).toBe(5);
    expect(new Vector2(-1, -1).magnitude).toBe(Math.sqrt(2));
    expect(new Vector2(-1, 0).magnitude).toBe(1);
    expect(new Vector2(0, 0).magnitude).toBe(0);
    expect(new Vector2(1, 0).magnitude).toBe(1);
    expect(new Vector2(1, 1).magnitude).toBe(Math.sqrt(2));
    expect(new Vector2(3, 4).magnitude).toBe(5);
  });

  it("exposes the angle in radians and degrees", () => {
    const vector = new Vector2(1, 1);

    expect(vector.angle.radians).toBe(Math.PI / 4);
    expect(vector.angle.degrees).toBe(45);
  });

  it("supports normalization", () => {
    const vector = new Vector2(3, 4);

    expect(vector.normalize()).toEqual(new Vector2(0.6, 0.8));
  });

  it("supports distance calculation", () => {
    expect(vector.distance(new Vector2(1, 2))).toBe(0);
    expect(vector.distance(new Vector2(2, 2))).toBe(1);
    expect(vector.distance(new Vector2(4, 6))).toBe(5);
  });

  it("supports setting the length", () => {
    const vector = new Vector2(6, 8);

    expect(vector.setLength(-1)).toEqual(new Vector2(-0.6, -0.8));
    expect(vector.setLength(0)).toEqual(Vector2.zero);
    expect(vector.setLength(1)).toEqual(new Vector2(0.6, 0.8));
    expect(vector.setLength(2)).toEqual(new Vector2(1.2, 1.6));
  });

  it("supports rotation", () => {
    const vector = new Vector2(1, 0);

    expect(vector.rotate(Angle.degrees(90)).x).toBeCloseTo(0);
    expect(vector.rotate(Angle.degrees(90)).y).toBeCloseTo(1);

    expect(vector.rotate(Angle.degrees(180)).x).toBeCloseTo(-1);
    expect(vector.rotate(Angle.degrees(180)).y).toBeCloseTo(0);

    expect(vector.rotate(Angle.degrees(270)).x).toBeCloseTo(0);
    expect(vector.rotate(Angle.degrees(270)).y).toBeCloseTo(-1);

    expect(vector.rotate(Angle.degrees(360)).x).toBeCloseTo(1);
    expect(vector.rotate(Angle.degrees(360)).y).toBeCloseTo(0);

    expect(vector.rotate(Angle.degrees(-90)).x).toBeCloseTo(0);
    expect(vector.rotate(Angle.degrees(-90)).y).toBeCloseTo(-1);

    expect(vector.rotate(Angle.degrees(-180)).x).toBeCloseTo(-1);
    expect(vector.rotate(Angle.degrees(-180)).y).toBeCloseTo(0);

    expect(vector.rotate(Angle.degrees(-270)).x).toBeCloseTo(0);
    expect(vector.rotate(Angle.degrees(-270)).y).toBeCloseTo(1);

    expect(vector.rotate(Angle.degrees(-360)).x).toBeCloseTo(1);
    expect(vector.rotate(Angle.degrees(-360)).y).toBeCloseTo(0);

    expect(vector.rotate(Angle.degrees(45)).x).toBeCloseTo(Math.sqrt(2) / 2);
    expect(vector.rotate(Angle.degrees(45)).y).toBeCloseTo(Math.sqrt(2) / 2);

    expect(vector.rotate(Angle.degrees(-45)).x).toBeCloseTo(
      Math.sqrt(2) / 2
    );
    expect(vector.rotate(Angle.degrees(-45)).y).toBeCloseTo(
      -Math.sqrt(2) / 2
    );

    expect(
      vector.rotate(Angle.degrees(90)).rotate(Angle.degrees(-90)).x
    ).toBeCloseTo(vector.x);
    expect(
      vector.rotate(Angle.degrees(90)).rotate(Angle.degrees(-90)).y
    ).toBeCloseTo(vector.y);
  });

  it("supports dot product", () => {
    expect(vector.dot(new Vector2(3, 4))).toBe(11);
    expect(vector.dot(new Vector2(4, 3))).toBe(10);
    expect(vector.dot(new Vector2(1, 2))).toBe(5);
    expect(vector.dot(new Vector2(2, 1))).toBe(4);
  });

  it("supports JSON serialization", () => {
    expect(vector.toJson()).toEqual({ x: 1, y: 2 });
  });

  it("supports custom JSON serialization format", () => {
    expect(vector.toJson((value) => value.toFixed(2))).toEqual({
      x: "1.00",
      y: "2.00",
    });
  });

  it("supports equality comparison", () => {
    expect(vector.equals(new Vector2(1, 2))).toBe(true);
    expect(vector.equals(new Vector2(3, 4))).toBe(false);
  });
});
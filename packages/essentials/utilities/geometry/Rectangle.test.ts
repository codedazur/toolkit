import { describe, expect, it } from "vitest";
import { Rectangle } from "./Rectangle";
import { Vector2 } from "./Vector2";

describe("Rectangle", () => {
  it("should calculate position", () => {
    const rectangle = new Rectangle(10, 20, 30, 40);
    expect(rectangle.position).toEqual(new Vector2(10, 20));
  });

  it("should calculate size", () => {
    const rectangle = new Rectangle(10, 20, 30, 40);
    expect(rectangle.size).toEqual(new Vector2(30, 40));
  });

  it("should calculate center", () => {
    const rectangle = new Rectangle(10, 20, 30, 40);
    expect(rectangle.center).toEqual(new Vector2(25, 40));
  });

  it("should calculate left", () => {
    const rectangle = new Rectangle(10, 20, 30, 40);
    expect(rectangle.left).toBe(10);
  });

  it("should calculate top", () => {
    const rectangle = new Rectangle(10, 20, 30, 40);
    expect(rectangle.top).toBe(20);
  });

  it("should calculate right", () => {
    const rectangle = new Rectangle(10, 20, 30, 40);
    expect(rectangle.right).toBe(40);
  });

  it("should calculate bottom", () => {
    const rectangle = new Rectangle(10, 20, 30, 40);
    expect(rectangle.bottom).toBe(60);
  });

  it("should move", () => {
    const rectangle = new Rectangle(10, 20, 30, 40);
    const moved = rectangle.move(new Vector2(100, 200));
    expect(moved).toEqual(new Rectangle(100, 200, 30, 40));
  });

  it("should translate", () => {
    const rectangle = new Rectangle(10, 20, 30, 40);
    const translated = rectangle.translate(new Vector2(100, 200));
    expect(translated).toEqual(new Rectangle(110, 220, 30, 40));
  });

  it("should resize", () => {
    const rectangle = new Rectangle(10, 20, 30, 40);
    const resized = rectangle.resize(new Vector2(100, 200));
    expect(resized).toEqual(new Rectangle(10, 20, 100, 200));
  });

  it("should scale", () => {
    const rectangle = new Rectangle(10, 20, 30, 40);
    const scaled = rectangle.scale(new Vector2(2, 3));
    expect(scaled).toEqual(new Rectangle(10, 20, 60, 120));
  });

  it("should calculate fraction", () => {
    const rectangle = new Rectangle(10, 20, 30, 40);
    expect(rectangle.fraction(new Vector2(0.5, 0.5))).toEqual(
      new Vector2(15, 20),
    );
  });

  it("should calculate point", () => {
    const rectangle = new Rectangle(10, 20, 30, 40);
    expect(rectangle.point(new Vector2(0.5, 0.5))).toEqual(new Vector2(25, 40));
  });

  it("should calculate equality", () => {
    const rectangle = new Rectangle(10, 20, 30, 40);
    expect(rectangle.equals(new Rectangle(10, 20, 30, 40))).toBe(true);
    expect(rectangle.equals(new Rectangle(11, 20, 30, 40))).toBe(false);
    expect(rectangle.equals(new Rectangle(10, 21, 30, 40))).toBe(false);
    expect(rectangle.equals(new Rectangle(10, 20, 31, 40))).toBe(false);
    expect(rectangle.equals(new Rectangle(10, 20, 30, 41))).toBe(false);
  });

  it("should know whether it contains a point", () => {
    const rectangle = new Rectangle(10, 20, 30, 40);
    expect(rectangle.contains(new Vector2(0, 0))).toBe(false);
    expect(rectangle.contains(new Vector2(15, 40))).toBe(true);
  });

  it("should know whether it intersects another rectangle", () => {
    const rectangle = new Rectangle(10, 20, 30, 40);
    expect(rectangle.intersects(new Rectangle(0, 0, 5, 5))).toBe(false);
    expect(rectangle.intersects(new Rectangle(15, 40, 5, 5))).toBe(true);
  });
});

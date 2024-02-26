import { describe, expect, it } from "vitest";
import { Origin } from "./Origin";
import { Vector2 } from "./Vector2";

describe("Origin", () => {
  it("should provide common origins relative to the top left corner", () => {
    expect(Origin.topLeft).toEqual(new Vector2(0, 0));
    expect(Origin.top).toEqual(new Vector2(0.5, 0));
    expect(Origin.topRight).toEqual(new Vector2(1, 0));
    expect(Origin.right).toEqual(new Vector2(1, 0.5));
    expect(Origin.bottomRight).toEqual(new Vector2(1, 1));
    expect(Origin.bottom).toEqual(new Vector2(0.5, 1));
    expect(Origin.bottomLeft).toEqual(new Vector2(0, 1));
    expect(Origin.left).toEqual(new Vector2(0, 0.5));
    expect(Origin.center).toEqual(new Vector2(0.5, 0.5));
  });

  it("should support origins relative to the center", () => {
    expect(Origin.fromCenter(Origin.topLeft)).toEqual(new Vector2(-0.5, -0.5));
    expect(Origin.fromCenter(Origin.top)).toEqual(new Vector2(0, -0.5));
    expect(Origin.fromCenter(Origin.topRight)).toEqual(new Vector2(0.5, -0.5));
    expect(Origin.fromCenter(Origin.right)).toEqual(new Vector2(0.5, 0));
    expect(Origin.fromCenter(Origin.bottomRight)).toEqual(
      new Vector2(0.5, 0.5),
    );
    expect(Origin.fromCenter(Origin.bottom)).toEqual(new Vector2(0, 0.5));
    expect(Origin.fromCenter(Origin.bottomLeft)).toEqual(
      new Vector2(-0.5, 0.5),
    );
    expect(Origin.fromCenter(Origin.left)).toEqual(new Vector2(-0.5, 0));
    expect(Origin.fromCenter(Origin.center)).toEqual(new Vector2(0, 0));
  });
});

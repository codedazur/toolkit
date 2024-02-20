import { describe, expect, it } from "vitest";
import { Direction } from "./Direction";
import { Vector2 } from "./Vector2";

describe("Direction", () => {
  it("should provide cardinal directions", () => {
    expect(Direction.left).toEqual(new Vector2(-1, 0));
    expect(Direction.up).toEqual(new Vector2(0, -1));
    expect(Direction.right).toEqual(new Vector2(1, 0));
    expect(Direction.down).toEqual(new Vector2(0, 1));
  });
});

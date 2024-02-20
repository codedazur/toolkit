import { Vector2 } from "./Vector2";

export class Direction extends Vector2 {
  public static left = new Direction(-1, 0);
  public static up = new Direction(0, -1);
  public static right = new Direction(1, 0);
  public static down = new Direction(0, 1);
}

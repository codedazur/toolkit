import { Vector2 } from "./Vector2";

export class Origin extends Vector2 {
  public static topLeft = new Origin(0, 0);
  public static top = new Origin(0.5, 0);
  public static topRight = new Origin(1, 0);
  public static right = new Origin(1, 0.5);
  public static bottomRight = new Origin(1, 1);
  public static bottom = new Origin(0.5, 1);
  public static bottomLeft = new Origin(0, 1);
  public static left = new Origin(0, 0.5);
  public static center = new Origin(0.5, 0.5);

  public static fromCenter(origin: Origin) {
    return origin.subtract(Origin.center);
  }
}

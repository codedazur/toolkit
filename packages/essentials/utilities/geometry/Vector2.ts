import { Angle } from "./Angle";

export class Vector2 {
  public static zero = new Vector2(0);
  public static one = new Vector2(1);

  public x: number;
  public y: number;

  constructor(x: number, y?: number) {
    this.x = x;
    this.y = y ?? x;
  }

  public equals(other: Vector2): boolean {
    return this.x === other.x && this.y === other.y;
  }

  public add(other: number | Vector2): Vector2 {
    return new Vector2(
      this.x + (other instanceof Vector2 ? other.x : other),
      this.y + (other instanceof Vector2 ? other.y : other),
    );
  }

  public subtract(other: number | Vector2): Vector2 {
    return new Vector2(
      this.x - (other instanceof Vector2 ? other.x : other),
      this.y - (other instanceof Vector2 ? other.y : other),
    );
  }

  public multiply(other: number | Vector2): Vector2 {
    return new Vector2(
      this.x * (other instanceof Vector2 ? other.x : other),
      this.y * (other instanceof Vector2 ? other.y : other),
    );
  }

  public divide(other: number | Vector2): Vector2 {
    return new Vector2(
      this.x / (other instanceof Vector2 ? other.x : other),
      this.y / (other instanceof Vector2 ? other.y : other),
    );
  }

  public invert(): Vector2 {
    return this.multiply(-1);
  }

  public get magnitude(): number {
    return Math.hypot(this.x, this.y);
  }

  public get angle(): Angle {
    return new Angle(Math.atan2(this.y, this.x));
  }

  public normalize(): Vector2 {
    return this.divide(this.magnitude);
  }

  public distance(other: Vector2): number {
    const { x, y } = this.subtract(other);
    return Math.hypot(x, y);
  }

  public setLength(length: number): Vector2 {
    return this.normalize().multiply(length);
  }

  public rotate(angle: Angle): Vector2 {
    const { x, y } = this;
    const cos = Math.cos(angle.radians);
    const sin = Math.sin(angle.radians);

    return new Vector2(x * cos - y * sin, x * sin + y * cos);
  }

  public dot(other: Vector2): number {
    return this.x * other.x + this.y * other.y;
  }

  public toJson(format?: (element: number) => number | string): {
    x: number | string;
    y: number | string;
  } {
    return {
      x: format?.(this.x) ?? this.x,
      y: format?.(this.y) ?? this.y,
    };
  }
}

export type MaybeVector2 = number | Vector2;
export function isVector2(value: unknown): value is Vector2 {
  return !!value && value instanceof Vector2;
}

export type MaybeVector2Like = number | Vector2Like;
export type Vector2Like = Vector2 | { x: number; y: number };
export function isVector2Like(value: unknown): value is Vector2Like {
  return !!value && typeof value === "object" && "x" in value && "y" in value;
}
export function isPartialVector2Like(
  value: unknown,
): value is Partial<Vector2Like> {
  return !!value && typeof value === "object" && ("x" in value || "y" in value);
}

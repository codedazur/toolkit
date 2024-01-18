import { Vector2 } from "./Vector2";

export class Rectangle {
  public x: number;
  public y: number;
  public width: number;
  public height: number;

  public static zero: Rectangle = new Rectangle(0, 0, 0, 0);

  constructor(x: number, y: number, width: number, height: number) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
  }

  static fromDOMRect(rect: DOMRect): Rectangle {
    return new Rectangle(rect.x, rect.y, rect.width, rect.height);
  }

  public get position(): Vector2 {
    return new Vector2(this.x, this.y);
  }

  public get size(): Vector2 {
    return new Vector2(this.width, this.height);
  }

  public get center(): Vector2 {
    return this.position.add(this.size.divide(2));
  }

  public get left(): number {
    return this.x;
  }

  public get top(): number {
    return this.y;
  }

  public get right(): number {
    return this.x + this.width;
  }

  public get bottom(): number {
    return this.y + this.height;
  }

  public move(position: Vector2): Rectangle {
    return new Rectangle(position.x, position.y, this.width, this.height);
  }

  public translate(offset: Vector2): Rectangle {
    return new Rectangle(
      this.x + offset.x,
      this.y + offset.y,
      this.width,
      this.height,
    );
  }

  public resize(size: Vector2, origin: Vector2 = Vector2.zero): Rectangle {
    return new Rectangle(this.x, this.y, size.x, size.y).translate(
      this.size.subtract(size).multiply(origin),
    );
  }

  public expand(expansion: number | Vector2, origin?: Vector2): Rectangle {
    return this.resize(this.size.add(expansion), origin);
  }

  public scale(factor: number | Vector2, origin?: Vector2): Rectangle {
    return this.resize(this.size.multiply(factor), origin);
  }

  public fraction(point: Vector2): Vector2 {
    return this.size.multiply(point);
  }

  public point(point: Vector2): Vector2 {
    return this.position.add(this.fraction(point));
  }

  public equals(other: Rectangle): boolean {
    return (
      this.x === other.x &&
      this.y === other.y &&
      this.width === other.width &&
      this.height === other.height
    );
  }

  public contains(point: Vector2): boolean {
    return (
      point.x >= this.left &&
      point.x <= this.right &&
      point.y >= this.top &&
      point.y <= this.bottom
    );
  }

  public intersects(other: Rectangle): boolean {
    return !(
      this.right < other.left ||
      this.left > other.right ||
      this.top > other.bottom ||
      this.bottom < other.top
    );
  }
}

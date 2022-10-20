import { deg2rad } from "../math/deg2rad";
import { rad2deg } from "../math/rad2deg";

export class Angle {
  public radians: number;

  constructor(radians: number) {
    this.radians = radians;
  }

  public static degrees(degrees: number) {
    return new Angle(deg2rad(degrees));
  }

  public get degrees() {
    return rad2deg(this.radians);
  }
}

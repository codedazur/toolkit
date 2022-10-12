import { deg2rad, rad2deg } from "@codedazur/utilities/math";

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

import { rekeyObject } from "./rekeyObject";

const object = { a: 1, b: 2, c: 3 };

describe("rekeyObject", () => {
  it("rekeys an object", () => {
    expect(rekeyObject(object, ([key, value]) => `${key}${value}`)).toEqual({
      a1: 1,
      b2: 2,
      c3: 3,
    });
  });

  it("does not mutate the original object", () => {
    rekeyObject(object, ([key, value]) => `${key}${value}`);
    expect(object).toEqual({ a: 1, b: 2, c: 3 });
  });
});

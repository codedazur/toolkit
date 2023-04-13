import {describe, it, expect} from 'vitest';
import { pick } from './pick';

describe("pick", () => {
  it("should pick specified properties from an object", () => {
    const obj = { a: 1, b: "hello", c: true };
    const result = pick(obj, ["a", "c"]);
    expect(result).toEqual({ a: 1, c: true });
  });

  it("should return an empty object when given an empty keys array", () => {
    const obj = { a: 1, b: "hello", c: true };
    const result = pick(obj, []);
    expect(result).toEqual({});
  });

  it("should handle missing properties gracefully", () => {
    const obj = { a: 1, b: "hello", c: true };
    const result = pick(obj, ["a", "d"] as any);
    expect(result).toEqual({ a: 1 });
  });

  it("should not modify the original object", () => {
    const obj = { a: 1, b: "hello", c: true };
    pick(obj, ["a", "b"] as any);
    expect(obj).toEqual({ a: 1, b: "hello", c: true });
  });
});

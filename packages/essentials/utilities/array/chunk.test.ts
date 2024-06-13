import { describe, expect, it } from "vitest";
import { chunk } from "./chunk";

describe("chunk", () => {
  it("should chunk an array into smaller arrays", () => {
    const array = [1, 2, 3, 4];
    const chunkedArray = chunk(array, 2);
    expect(chunkedArray).toEqual([
      [1, 2],
      [3, 4],
    ]);
  });

  it("should handle an empty array", () => {
    expect(chunk([], 2)).toEqual([]);
  });

  it("should handle remainders", () => {
    const array = [1, 2, 3, 4, 5];
    const chunkedArray = chunk(array, 3);
    expect(chunkedArray).toEqual([
      [1, 2, 3],
      [4, 5],
    ]);
  });

  it("should not modify the original array", () => {
    const array = [1, 2, 3, 4];
    chunk(array, 2);
    expect(array).toEqual([1, 2, 3, 4]);
  });

  it("should throw an error when given a size of 0", () => {
    expect(() => chunk([1, 2, 3, 4], 0)).toThrow();
  });

  it("should throw an error when given a negative size", () => {
    expect(() => chunk([1, 2, 3, 4], -1)).toThrow();
  });
});

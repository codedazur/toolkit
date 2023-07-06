import { shuffle } from "./shuffle";
import { describe, it, expect } from "vitest";

describe("shuffle", () => {
  it("should return an empty array when given an empty array", () => {
    expect(shuffle([])).toEqual([]);
  });

  it("should return an array with the same length when given an array", () => {
    const array = [1, 2, 3, 4, 5];
    const shuffledArray = shuffle(array);
    expect(shuffledArray).toHaveLength(array.length);
  });

  it("should return an array with the same elements when given an array", () => {
    const array = [1, 2, 3, 4, 5];
    const shuffledArray = shuffle(array);
    expect(shuffledArray.sort()).toEqual(array.sort());
  });

  it("should not modify the original array", () => {
    const array = [1, 2, 3, 4, 5];
    shuffle(array);
    expect(array).toEqual([1, 2, 3, 4, 5]);
  });

  it("should handle arrays with duplicate elements", () => {
    const array = [1, 1, 2, 2, 3, 3, 4, 4, 5, 5];
    const shuffledArray = shuffle(array);
    expect(shuffledArray.sort()).toEqual(array.sort());
  });
});

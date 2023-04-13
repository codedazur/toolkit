import { omit } from "./omit";

import {describe, it, expect} from 'vitest';

describe("omit", () => {
  it("should omit a single key from an object", () => {
    const input = { a: 1, b: 2, c: 3 };
    const output = omit(input, ["a"]);

    expect(output).toEqual({ b: 2, c: 3 });
  });

  it("should omit multiple keys from an object", () => {
    const input = { a: 1, b: 2, c: 3, d: 4 };
    const output = omit(input, ["a", "c"]);

    expect(output).toEqual({ b: 2, d: 4 });
  });

  it("should return the same object if no keys are omitted", () => {
    const input = { a: 1, b: 2, c: 3 };
    const output = omit(input, []);

    expect(output).toEqual(input);
  });

  it("should handle objects with no keys", () => {
    const input = {};
    const output = omit(input, []);

    expect(output).toEqual({});
  });

  it("should handle objects with only omitted keys", () => {
    const input = { a: 1, b: 2 };
    const output = omit(input, ["a", "b"]);

    expect(output).toEqual({});
  });
  

});

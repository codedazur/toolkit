import { describe, it, expect } from "vitest";
import { AssertionError, assert } from "./assert";

describe("assert", () => {
  it("should throw an Assertion Error when the condition is false", () => {
    expect(() => assert(false)).toThrowError(new AssertionError());
  });
  it("should throw an Assertion Error with provided message  when the condition is false", () => {
    expect(() =>
      assert(false, "These pretzels are making me thirsty!")
    ).toThrowError(new AssertionError("These pretzels are making me thirsty!"));
  });
  it("should not throw an Assertion Error when the condition is true", () => {
    expect(() => assert(true)).not.toThrow();
  });
});

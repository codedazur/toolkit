import { describe, expect, it } from "vitest";
import { camelCase } from "./camelCase";

describe("camelCase", () => {
  it("converts a string to camelCase", () => {
    expect(camelCase("this is a test")).toBe("thisIsATest");
  });

  it("removes special characters", () => {
    expect(camelCase("this is a... test?")).toBe("thisIsATest");
    expect(camelCase("this-is-a-test")).toBe("thisIsATest");
    expect(camelCase("this_is_a_test")).toBe("thisIsATest");
    expect(camelCase("this/is/a/test")).toBe("thisIsATest");
  });

  it("supports PascalCase input", () => {
    expect(camelCase("ThisIsATest")).toBe("thisIsATest");
  });

  it("supports camelCase input", () => {
    expect(camelCase("thisIsATest")).toBe("thisIsATest");
  });

  it("supports UPPER CASE input", () => {
    expect(camelCase("THIS IS A TEST")).toBe("thisIsATest");
  });

  it("supports CONST_CASE input", () => {
    expect(camelCase("THIS_IS_A_TEST")).toBe("thisIsATest");
  });
});

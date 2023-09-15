import { describe, expect, it } from "vitest";
import { pascalCase } from "./pascalCase";

describe("pascalCase", () => {
  it("converts a string to PascalCase", () => {
    expect(pascalCase("this is a test")).toBe("ThisIsATest");
  });

  it("removes special characters", () => {
    expect(pascalCase("this is a... test?")).toBe("ThisIsATest");
    expect(pascalCase("this-is-a-test")).toBe("ThisIsATest");
    expect(pascalCase("this_is_a_test")).toBe("ThisIsATest");
    expect(pascalCase("this/is/a/test")).toBe("ThisIsATest");
  });

  it("supports PascalCase input", () => {
    expect(pascalCase("ThisIsATest")).toBe("ThisIsATest");
  });

  it("supports camelCase input", () => {
    expect(pascalCase("thisIsATest")).toBe("ThisIsATest");
  });

  it("supports UPPER CASE input", () => {
    expect(pascalCase("THIS IS A TEST")).toBe("ThisIsATest");
  });

  it("supports CONST_CASE input", () => {
    expect(pascalCase("THIS_IS_A_TEST")).toBe("ThisIsATest");
  });
});

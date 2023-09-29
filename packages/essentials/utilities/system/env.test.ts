import { afterEach, describe, expect, it, vi } from "vitest";
import { env } from "./env";

afterEach(() => {
  vi.unstubAllEnvs();
});

describe("env", () => {
  it("should return the value when it exists", () => {
    vi.stubEnv("FOO", "bar");
    expect(env("FOO")).toBe("bar");
  });

  it("should return undefined when the value does not exist", () => {
    expect(env("FOO")).toBeUndefined();
  });

  it("should return the fallback when the value does not exist", () => {
    expect(env("FOO", "bar")).toBe("bar");
  });

  it("should return the fallback when the value is empty", () => {
    vi.stubEnv("FOO", "");
    expect(env("FOO", "bar")).toBe("bar");
  });

  it("should parse numbers", () => {
    vi.stubEnv("FOO", "5");
    expect(env.int("FOO")).toBe(5);
  });

  it("should parse floats", () => {
    vi.stubEnv("FOO", "5.5");
    expect(env.float("FOO")).toBe(5.5);
  });

  it("should parse booleans", () => {
    vi.stubEnv("FOO", "true");
    expect(env.bool("FOO")).toBe(true);
  });

  it("should parse dates", () => {
    vi.stubEnv("FOO", "2021-01-01");
    expect(env.date("FOO")).toEqual(new Date("2021-01-01"));
  });

  it("should parse strings", () => {
    vi.stubEnv("FOO", "foo,bar,baz");
    expect(env.strings("FOO")).toEqual(["foo", "bar", "baz"]);
  });

  it("should parse ints", () => {
    vi.stubEnv("FOO", "1,2,3");
    expect(env.ints("FOO")).toEqual([1, 2, 3]);
  });

  it("should parse floats", () => {
    vi.stubEnv("FOO", "1.1,2.2,3.3");
    expect(env.floats("FOO")).toEqual([1.1, 2.2, 3.3]);
  });

  it("should parse bools", () => {
    vi.stubEnv("FOO", "true,false,true");
    expect(env.bools("FOO")).toEqual([true, false, true]);
  });

  it("should parse dates", () => {
    vi.stubEnv("FOO", "2021-01-01,2021-01-02,2021-01-03");
    expect(env.dates("FOO")).toEqual([
      new Date("2021-01-01"),
      new Date("2021-01-02"),
      new Date("2021-01-03"),
    ]);
  });

  it("should throw an error when the value cannot be parsed as a boolean", () => {
    vi.stubEnv("FOO", "foo");
    expect(() => env.bool("FOO")).toThrowError();
  });
});

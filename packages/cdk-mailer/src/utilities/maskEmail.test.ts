import { describe, expect, it } from "vitest";
import { maskEmail } from "./maskEmail";

describe("maskEmail", () => {
  it("masks standard email addresses", () => {
    expect(maskEmail("john.doe@example.com")).toBe("jo***e@example.com");
  });

  it("handles sub-addressing as a single local-part string", () => {
    expect(maskEmail("john.doe+123@example.com")).toBe("jo***3@example.com");
  });

  it("handles short local-parts gracefully", () => {
    expect(maskEmail("abc@example.com")).toBe("a***@example.com");
    expect(maskEmail("a@example.com")).toBe("a***@example.com");
  });

  it("preserves the domain exactly", () => {
    const complexDomain = "user@sub.department.example.co.uk";
    expect(maskEmail(complexDomain)).toBe(
      "us***r@sub.department.example.co.uk",
    );
  });

  it("returns a distinct token for malformed or missing data", () => {
    expect(maskEmail("not-an-email")).toBe("[INVALID_EMAIL]");
    expect(maskEmail("@no-local-part.com")).toBe("[INVALID_EMAIL]");
    expect(maskEmail("")).toBe("[INVALID_EMAIL]");
    expect(maskEmail(null)).toBe("[INVALID_EMAIL]");
    expect(maskEmail(undefined)).toBe("[INVALID_EMAIL]");
  });
});

import { cleanup } from "@testing-library/react";
import { afterEach } from "vitest";

// Clears the JSDom after each "it" statement
afterEach(() => {
  cleanup();
});

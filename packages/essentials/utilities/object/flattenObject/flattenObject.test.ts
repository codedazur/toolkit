import { flattenObject } from "./flattenObject";
import { describe, it, expect } from "vitest";

describe("flattenObject", () => {
  it("should support various levels of nesting", () => {
    expect(
      flattenObject({
        red: {
          100: "#000001",
          200: "#000002",
          300: "#000003",
        },
        primary: {
          base: "#000004",
          onBase: "#000005",
          container: "#000006",
          onContainer: "#000007",
        },
        surface: {
          base: "#000008",
          onBase: "#000009",
          container: {
            lowest: "#00000A",
            low: "#00000B",
            medium: "#00000C",
            high: "#00000D",
            highest: "#00000E",
          },
        },
      }),
    ).toEqual({
      "red.100": "#000001",
      "red.200": "#000002",
      "red.300": "#000003",
      "primary.base": "#000004",
      "primary.onBase": "#000005",
      "primary.container": "#000006",
      "primary.onContainer": "#000007",
      "surface.base": "#000008",
      "surface.onBase": "#000009",
      "surface.container.lowest": "#00000A",
      "surface.container.low": "#00000B",
      "surface.container.medium": "#00000C",
      "surface.container.high": "#00000D",
      "surface.container.highest": "#00000E",
    });
  });

  it("should support limiting the depth of the flattening", () => {
    expect(
      flattenObject(
        {
          flex: {
            justify: {
              control: { type: "select" },
              options: ["start", "center", "end"],
            },
          },
        },
        { maxDepth: 2 },
      ),
    ).toEqual({
      "flex.justify": {
        control: { type: "select" },
        options: ["start", "center", "end"],
      },
    });
  });
});

import {
  semanticTokens,
  boxShadow,
  linearGradient,
  LinearGradientStyle,
  primitiveTokens,
} from "@codedazur/fusion-ui/style";
import { recipe } from "@vanilla-extract/recipes";

const lineColor = semanticTokens.colors.surface.outline;

const lineStops: LinearGradientStyle["stops"] = [
  [null, 0],
  [null, "calc(50% - 0.8px)"],
  [lineColor, 0.5],
  [null, "calc(50% + 0.8px)"],
  [null, 1],
];

export const placeholder = recipe({
  base: {
    font: semanticTokens.typography.label.medium,
    fontFamily: primitiveTokens.fontFamily[5],
  },
  variants: {
    bordered: {
      true: {
        boxShadow: boxShadow({
          color: lineColor,
          blur: 0,
          spread: 1,
          inset: true,
        }),
      },
    },
    crossed: {
      true: {
        backgroundImage: [
          linearGradient({
            angle: "to top left",
            stops: lineStops,
          }),
          linearGradient({
            angle: "to top right",
            stops: lineStops,
          }),
        ].join(", "),
      },
    },
  },
});

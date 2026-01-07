import { semanticTokens } from "@codedazur/fusion-ui/style";
import { recipe } from "@vanilla-extract/recipes";

export const day = recipe({
  base: {
    position: "relative",
  },

  variants: {
    isSelected: {
      true: {
        background: semanticTokens.colors.primary.base,
        color: semanticTokens.colors.primary.onBase,
      },
    },
    isInActiveMonth: {
      false: {
        opacity: 0.25,
      },
    },
    isInFocusedRange: {
      true: {
        borderRadius: 0,
        backgroundColor: semanticTokens.colors.surface.container.low,
        color: semanticTokens.colors.surface.onBase,
      },
    },
    isInSelectedRange: {
      true: {
        borderRadius: 0,
        selectors: {
          "&:not(:hover)": {
            backgroundColor: semanticTokens.colors.primary.container,
            color: semanticTokens.colors.primary.onContainer,
          },
          "&:hover": {
            backgroundColor: semanticTokens.colors.primary.base,
            color: semanticTokens.colors.primary.onBase,
          },
        },
      },
    },
    isFirstDate: {
      true: {
        borderTopLeftRadius: "50%",
        borderBottomLeftRadius: "50%",
      },
    },
    isLastDate: {
      true: {
        borderTopRightRadius: "50%",
        borderBottomRightRadius: "50%",
      },
    },
  },
});

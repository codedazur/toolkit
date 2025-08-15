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
      true: {},
    },
    isInSelectedRange: {
      true: {},
    },
    isFirstDate: {
      true: {},
    },
    isLastDate: {
      true: {},
    },
  },

  compoundVariants: [
    {
      variants: {
        isInFocusedRange: true,
      },
      style: {
        ":before": {
          content: '""',
          position: "absolute",
          left: 0,
          top: 0,
          right: 0,
          bottom: 0,
          backgroundColor: semanticTokens.colors.primary.container,
        },
      },
    },
    {
      variants: {
        isInSelectedRange: true,
      },
      style: {
        selectors: {
          "&:not(:hover):before": {
            content: '""',
            position: "absolute",
            left: 0,
            top: 0,
            right: 0,
            bottom: 0,
            backgroundColor: semanticTokens.colors.primary.container,
          },
        },
      },
    },
    {
      variants: {
        isFirstDate: true,
      },
      style: {
        ":before": {
          borderTopLeftRadius: "50%",
          borderBottomLeftRadius: "50%",
        },
      },
    },
    {
      variants: {
        isLastDate: true,
      },
      style: {
        ":before": {
          borderTopRightRadius: "50%",
          borderBottomRightRadius: "50%",
        },
      },
    },
    {
      variants: {
        isInSelectedRange: false,
      },
      style: {
        selectors: {
          "&:hover:before": {
            borderTopRightRadius: "50%",
            borderBottomRightRadius: "50%",
          },
        },
      },
    },
  ],
});

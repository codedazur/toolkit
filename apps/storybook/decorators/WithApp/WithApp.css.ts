import { tokens } from "@codedazur/fusion-ui/style";
import { globalStyle } from "@vanilla-extract/css";

globalStyle(".sb-main-fullscreen > #storybook-root", {
  height: "100%",
});

globalStyle("body", {
  backgroundColor: tokens.semantic.colors.surface.base,
  color: tokens.semantic.colors.surface.onBase,
});

import { darkTheme, deepPurple, Theme } from "@codedazur/react-components";
import Color from "color";

export const storyTheme: Theme = {
  ...darkTheme,

  colors: {
    ...darkTheme.colors,
    primary: deepPurple[500],
  },

  text: {
    ...darkTheme.text,

    body: {
      ...darkTheme.text.body,
      fontFamily: "monospace",
    },
  },
};

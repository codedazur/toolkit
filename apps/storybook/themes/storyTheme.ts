import { darkTheme, Theme } from "@codedazur/react-components";
import Color from "color";

export const storyTheme: Theme = {
  ...darkTheme,

  colors: {
    ...darkTheme.colors,
    primary: new Color(0xff1747),
  },

  text: {
    ...darkTheme.text,

    body: {
      ...darkTheme.text.body,
      fontFamily: "monospace",
    },
  },
};

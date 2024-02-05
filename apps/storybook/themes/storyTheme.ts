import { darkTheme, deepPurple, Theme } from "@codedazur/react-components";

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
      font: "monospace",
    },
  },
};

import { darkTheme, Theme } from "@codedazur/react-components";

export const storyTheme: Theme = {
  ...darkTheme,

  text: {
    ...darkTheme.text,

    body: {
      ...darkTheme.text.body,
      fontFamily: "monospace",
    },
  },
};

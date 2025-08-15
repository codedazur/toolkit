import { App } from "../../components/App/App";
import {
  componentTheme,
  darkTheme,
  lightTheme,
  primitiveTheme,
} from "@codedazur/fusion-ui/style";
import { usePrevious } from "@codedazur/react-essentials";
import { Decorator } from "@storybook/nextjs";
import { useEffect } from "react";

import "./WithApp.css";

const themes: Record<string, string> = {
  Light: lightTheme,
  Dark: darkTheme,
};

export const WithApp: Decorator = (Story, { globals: { theme } }) => {
  const previousTheme = usePrevious(themes[theme]);

  useEffect(() => {
    document.body.classList.add(primitiveTheme, componentTheme);
  }, []);

  useEffect(() => {
    previousTheme
      ? document.body.classList.replace(previousTheme, themes[theme])
      : document.body.classList.add(themes[theme]);
  }, [theme, previousTheme]);

  return (
    <App theme={theme}>
      <Story />
    </App>
  );
};

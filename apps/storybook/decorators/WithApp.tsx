import { App } from "@codedazur/react-components";
import { Decorator } from "@storybook/react";
import { storyTheme } from "../themes/storyTheme";

export const WithApp: Decorator = (Story) => (
  <App theme={storyTheme}>
    <Story />
  </App>
);

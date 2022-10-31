import { App } from "@codedazur/react-components";
import { DecoratorFn } from "@storybook/react";
import { storyTheme } from "../themes/storyTheme";

export const WithApp: DecoratorFn = (Story) => (
  <App rootSelector="#root" theme={storyTheme}>
    <Story />
  </App>
);

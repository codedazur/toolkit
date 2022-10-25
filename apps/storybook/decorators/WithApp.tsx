import { App, lightTheme } from "@codedazur/react-components";
import { DecoratorFn } from "@storybook/react";

export const WithApp: DecoratorFn = (Story) => (
  <App rootSelector="#root" theme={lightTheme}>
    <Story />
  </App>
);

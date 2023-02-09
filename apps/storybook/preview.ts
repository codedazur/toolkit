import { DecoratorFn, Parameters } from "@storybook/react";
import { WithApp } from "./decorators/WithApp";

export const decorators: DecoratorFn[] = [WithApp];

export const parameters: Parameters = {
  actions: { argTypesRegex: "^on[A-Z].*" },
  controls: {
    matchers: {
      color: /(background|color)$/i,
      date: /Date$/,
    },
  },
};

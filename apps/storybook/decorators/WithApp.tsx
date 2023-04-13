import { App, Background, Padding } from "@codedazur/react-components";
import { DecoratorFn } from "@storybook/react";
import { storyTheme } from "../themes/storyTheme";

export const WithApp: DecoratorFn = (Story) => (
  <App rootSelector="#root" theme={storyTheme}>
    <Background>
      <Padding padding="1.5rem">
        <Story />
      </Padding>
    </Background>
  </App>
);

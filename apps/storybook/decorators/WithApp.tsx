import { App, Background, Padding } from "@codedazur/react-components";
import { Decorator } from "@storybook/react";
import { storyTheme } from "../themes/storyTheme";

export const WithApp: Decorator = (Story) => (
  <App rootSelector="#storybook-root" theme={storyTheme}>
    <Background>
      <Padding padding="1.5rem">
        <Story />
      </Padding>
    </Background>
  </App>
);
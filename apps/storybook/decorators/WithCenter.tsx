import { Center } from "@codedazur/react-components";
import { Decorator } from "@storybook/react";

export const WithCenter: Decorator = (Story) => (
  <Center>
    <Story />
  </Center>
);

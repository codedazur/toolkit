import { Center } from "@codedazur/react-components";
import { DecoratorFn } from "@storybook/react";

export const WithCenter: DecoratorFn = (Story) => (
  <Center>
    <Story />
  </Center>
);

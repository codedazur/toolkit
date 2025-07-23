import { Center } from "@codedazur/react-components";
import { Decorator } from "@storybook/react-vite";

export const WithCenter: Decorator = (Story) => (
  <Center>
    <Story />
  </Center>
);

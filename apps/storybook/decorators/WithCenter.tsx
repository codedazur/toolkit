import { Center } from "@codedazur/fusion-ui";
import { Decorator } from "@storybook/react-vite";

export const WithCenter: Decorator = (Story) => (
  <Center>
    <Story />
  </Center>
);

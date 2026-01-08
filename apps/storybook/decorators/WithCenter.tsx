import { Center } from "@codedazur/fusion-ui";
import { Decorator } from "@storybook/nextjs";

export const WithCenter: Decorator = (Story) => (
  <Center>
    <Story />
  </Center>
);

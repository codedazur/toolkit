import { Text, Center } from "@codedazur/react-components";

import { useContrastPreferences } from "@codedazur/react-preferences";

import docs from "./useContrastPreferences.docs.mdx";
import { Meta, StoryObj } from "@storybook/react-vite";

const meta: Meta = {
  title: "React/Preferences/useContrastPreferences",
  parameters: {
    docs: {
      page: docs,
    },
  },
};

export default meta;

export const Default: StoryObj = {
  render: function Default() {
    const preferedContrast = useContrastPreferences();

    return (
      <Center>
        <Text>User prefers {preferedContrast || "default"} contrast.</Text>
      </Center>
    );
  },
};

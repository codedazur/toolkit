import { Text, Center } from "@codedazur/react-components";

import { useColorSchemePreferences } from "@codedazur/react-preferences";

import docs from "./useColorSchemePreferences.docs.mdx";
import { Meta, StoryObj } from "@storybook/react-vite";

const meta: Meta = {
  title: "React/Preferences/useColorSchemePreferences",
  parameters: {
    docs: {
      page: docs,
    },
  },
};

export default meta;

export const Default: StoryObj = {
  render: function Default() {
    const preferedColorScheme = useColorSchemePreferences();

    return (
      <Center>
        <Text>User prefers a {preferedColorScheme} color scheme.</Text>
      </Center>
    );
  },
};

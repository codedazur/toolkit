import { Center, Text } from "@codedazur/fusion-ui";
import { useColorSchemePreferences } from "@codedazur/react-preferences";
import { Meta, StoryObj } from "@storybook/nextjs";
import docs from "./useColorSchemePreferences.docs.md";

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
        <Text variant="body">
          User prefers a {preferedColorScheme} color scheme.
        </Text>
      </Center>
    );
  },
};

import { Center, Text } from "@codedazur/fusion-ui";
import { useContrastPreferences } from "@codedazur/react-preferences";
import { Meta, StoryObj } from "@storybook/nextjs";
import docs from "./useContrastPreferences.docs.md";

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
        <Text variant="body">
          User prefers {preferedContrast || "default"} contrast.
        </Text>
      </Center>
    );
  },
};

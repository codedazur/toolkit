import { Center, Text } from "@codedazur/fusion-ui";
import { useMotionPreferences } from "@codedazur/react-preferences";
import { Meta, StoryObj } from "@storybook/nextjs";
import docs from "./useMotionPreferences.docs.md";

const meta: Meta = {
  title: "React/Preferences/useMotionPreferences",
  parameters: {
    docs: {
      page: docs,
    },
  },
};

export default meta;

export const Default: StoryObj = {
  render: function Default() {
    const preferedMotion = useMotionPreferences();

    return (
      <Center>
        <Text variant="body">
          User prefers {preferedMotion || "default"} motion.
        </Text>
      </Center>
    );
  },
};

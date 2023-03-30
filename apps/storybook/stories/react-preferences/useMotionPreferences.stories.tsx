import { Text, Center } from "@codedazur/react-components";

import { useMotionPreferences } from "@codedazur/react-preferences";
import { meta } from "storybook/utilities/meta";
import { story } from "storybook/utilities/story";
import docs from "./useMotionPreferences.docs.mdx";

export default meta({
  parameters: {
    docs: {
      page: docs,
    },
  },
});

export const Default = story(() => {
  const preferedMotion = useMotionPreferences();

  return (
    <Center>
      <Text>User prefers {preferedMotion || "default"} motion.</Text>
    </Center>
  );
});

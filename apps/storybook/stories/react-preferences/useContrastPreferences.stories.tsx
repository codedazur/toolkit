import { Text, Center } from "@codedazur/react-components";

import { useContrastPreferences } from "@codedazur/react-preferences";
import { meta } from "storybook/utilities/meta";
import { story } from "storybook/utilities/story";
import docs from "./useContrastPreferences.docs.mdx";

export default meta({
  parameters: {
    docs: {
      page: docs,
    },
  },
});

export const Default = story(() => {
  const preferedContrast = useContrastPreferences();

  return (
    <Center>
      <Text>User prefers {preferedContrast || "default"} contrast.</Text>
    </Center>
  );
});

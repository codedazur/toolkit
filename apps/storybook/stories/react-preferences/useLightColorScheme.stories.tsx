import { Text, Center } from "@codedazur/react-components";

import { useLightColorScheme } from "@codedazur/react-preferences/hooks/useLightColorScheme";
import { meta } from "storybook/utilities/meta";
import { story } from "storybook/utilities/story";
import docs from "./useLightColorScheme.docs.mdx";

export default meta({
  parameters: {
    docs: {
      page: docs,
    },
  },
});

export const Default = story(() => {
  const lightColorScheme = useLightColorScheme();

  return (
    <Center>
      <Text>User prefers light color scheme: {String(lightColorScheme)}</Text>
    </Center>
  );
});

import { Text, Center } from "@codedazur/react-components";

import { useColorScheme } from "@codedazur/react-preferences/hooks/useColorScheme";
import { meta } from "storybook/utilities/meta";
import { story } from "storybook/utilities/story";
import docs from "./useColorScheme.docs.mdx";

export default meta({
  title: 'useColorScheme',
  parameters: {
    docs: {
      page: docs,
    },
  },
});

export const Default = story(() => {
  const { prefersDark, prefersLight } = useColorScheme();

  return (
    <Center>
      <Text>User prefers dark color scheme: {String(prefersDark)}</Text>
      <Text>User prefers light color scheme: {String(prefersLight)}</Text>
    </Center>
  );
});

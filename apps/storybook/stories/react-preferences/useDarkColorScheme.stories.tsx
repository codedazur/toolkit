import { Text, Center } from "@codedazur/react-components";

import { useDarkColorScheme } from "@codedazur/react-preferences/hooks/useDarkColorScheme";
import { meta } from "storybook/utilities/meta";
import { story } from "storybook/utilities/story";
import docs from "./useDarkColorScheme.docs.mdx";

export default meta({
  parameters: {
    docs: {
      page: docs,
    },
  },
});

export const Default = story(() => {
  const darkColorScheme = useDarkColorScheme();

  return (
    <Center>
      <Text>User prefers dark color scheme: {String(darkColorScheme)}</Text>
    </Center>
  );
});

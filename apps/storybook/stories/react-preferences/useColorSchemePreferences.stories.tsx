import { Text, Center } from "@codedazur/react-components";

import { useColorSchemePreferences } from "@codedazur/react-preferences";
import { meta } from "storybook/utilities/meta";
import { story } from "storybook/utilities/story";
import docs from "./useColorSchemePreferences.docs.mdx";

export default meta({
  parameters: {
    docs: {
      page: docs,
    },
  },
});

export const Default = story(() => {
  const preferedColorScheme = useColorSchemePreferences();

  return (
    <Center>
      <Text>User prefers a {preferedColorScheme} color scheme.</Text>
    </Center>
  );
});

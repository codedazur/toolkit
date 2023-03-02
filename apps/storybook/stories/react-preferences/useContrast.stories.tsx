import { Text, Center } from "@codedazur/react-components";

import { useContrast } from "@codedazur/react-preferences";
import { meta } from "storybook/utilities/meta";
import { story } from "storybook/utilities/story";
import docs from "./useContrast.docs.mdx";

export default meta({
  title: 'useContrast',
  parameters: {
    docs: {
      page: docs,
    },
  },
});

export const Default = story(() => {
  const prefersContrast = useContrast();

  return (
    <Center>
      <Text>User prefers increased contrast: {String(prefersContrast)}</Text>
    </Center>
  );
});

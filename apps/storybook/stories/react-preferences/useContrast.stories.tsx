import { Text, Center } from "@codedazur/react-components";

import { useContrast } from "@codedazur/react-preferences";
import { meta } from "storybook/utilities/meta";
import { story } from "storybook/utilities/story";
import docs from "./useContrast.docs.mdx";

export default meta({
  parameters: {
    docs: {
      page: docs,
    },
  },
});

export const Default = story(() => {
  const { prefersMore, prefersLess, prefersCustom, hasForcedColors } =
    useContrast();

  return (
    <Center>
      <Text>User prefers more contrast: {String(prefersMore)}</Text>
      <Text>User prefers less contrast: {String(prefersLess)}</Text>
      <Text>User prefers custom contrast: {String(prefersCustom)}</Text>
      <Text>User has forced colors enabled: {String(hasForcedColors)}</Text>
    </Center>
  );
});

import { Text, Center } from "@codedazur/react-components";

import { useReducedMotion } from "@codedazur/react-preferences";
import { meta } from "storybook/utilities/meta";
import { story } from "storybook/utilities/story";
import docs from "./useReducedMotion.docs.mdx";

export default meta({
  parameters: {
    docs: {
      page: docs,
    },
  },
});

export const Default = story(() => {
  const reducedMotion = useReducedMotion();

  return (
    <Center>
      <Text>User prefers reduced motion: {String(reducedMotion)}</Text>
    </Center>
  );
});

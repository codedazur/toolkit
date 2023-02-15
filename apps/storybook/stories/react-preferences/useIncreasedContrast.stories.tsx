import { Text, Center } from "@codedazur/react-components";

import { useIncreasedContrast } from "@codedazur/react-preferences/hooks/useIncreasedContrast";
import { meta } from "storybook/utilities/meta";
import { story } from "storybook/utilities/story";
import docs from "./useIncreasedContrast.docs.mdx";

export default meta({
  parameters: {
    docs: {
      page: docs,
    },
  },
});

export const Default = story(() => {
  const increasedContrast = useIncreasedContrast();

  return (
    <Center>
      <Text>User prefers increased contrast: {String(increasedContrast)}</Text>
    </Center>
  );
});

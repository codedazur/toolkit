import { Text, Button, Center, Column, Row } from "@codedazur/react-components";
import { usePrevious } from "@codedazur/react-essentials";
import { useState } from "react";
import { meta } from "storybook/utilities/meta";
import { story } from "storybook/utilities/story";
import docs from "./usePrevious.docs.mdx";

export default meta({
  parameters: {
    docs: {
      page: docs,
    },
  },
});

export const Default = story(() => {
  const [count, setCount] = useState(0);
  const previousCount = usePrevious(count);

  return (
    <Center>
      <Column gap="1rem" style={{ minWidth: "170px" }}>
        <Text>Before: {String(previousCount)}</Text>
        <Text>Now: {count}</Text>

        <Row gap="1rem">
          <Button onClick={() => setCount(count - 1)}>-</Button>
          <Button onClick={() => setCount(count + 1)}>+</Button>
        </Row>
      </Column>
    </Center>
  );
});

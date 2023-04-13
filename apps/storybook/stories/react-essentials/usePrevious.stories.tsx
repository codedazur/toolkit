import { Text, Button, Center, Column, Row } from "@codedazur/react-components";
import { usePrevious } from "@codedazur/react-essentials";
import { useState } from "react";
import docs from "./usePrevious.docs.mdx";
import { Meta, StoryObj } from "@storybook/react";

const meta: Meta = {
  title: "React Essentials/usePrevious",
  parameters: {
    docs: {
      page: docs,
    },
  },
};

export default meta;

export const Default: StoryObj = {
  render: function Default() {
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
  },
};

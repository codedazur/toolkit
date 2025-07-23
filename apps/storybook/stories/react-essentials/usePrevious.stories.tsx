import { Button, Column, Row } from "@codedazur/react-components";
import { usePrevious } from "@codedazur/react-essentials";
import { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { DebugOverlay } from "../../components/DebugOverlay";
import { Monospace } from "../../components/Monospace";
import docs from "./usePrevious.docs.mdx";

const meta: Meta = {
  title: "React/Essentials/usePrevious",
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
      <>
        <Column gap="1rem">
          <Monospace>{count}</Monospace>
          <Row gap="1rem">
            <Button onClick={() => setCount((count) => count - 1)}>-</Button>
            <Button onClick={() => setCount((count) => count + 1)}>+</Button>
          </Row>
        </Column>
        <DebugOverlay value={{ usePrevious: previousCount }} />
      </>
    );
  },
};

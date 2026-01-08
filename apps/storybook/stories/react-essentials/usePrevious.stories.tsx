import { Row, SymbolButton, Text } from "@codedazur/fusion-ui";
import { usePrevious } from "@codedazur/react-essentials";
import { Meta, StoryObj } from "@storybook/nextjs";
import { useState } from "react";
import { DebugOverlay } from "../../components/DebugOverlay";
import docs from "./usePrevious.docs.md";

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
        <Row gap={400} align="center">
          <SymbolButton
            variant="tertiary"
            onClick={() => setCount((count) => count - 1)}
          >
            <Text font={5}>-</Text>
          </SymbolButton>
          <Text font={5}>{count}</Text>
          <SymbolButton
            variant="tertiary"
            onClick={() => setCount((count) => count + 1)}
          >
            <Text font={5}>+</Text>
          </SymbolButton>
        </Row>
        <DebugOverlay value={{ usePrevious: previousCount }} />
      </>
    );
  },
};

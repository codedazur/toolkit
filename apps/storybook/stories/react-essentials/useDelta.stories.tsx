import { Button, Column, Row } from "@codedazur/react-components";
import { useDelta } from "@codedazur/react-essentials";
import { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import { DebugOverlay } from "../../components/DebugOverlay";
import { Monospace } from "../../components/Monospace";
import docs from "./usePrevious.docs.mdx";

const meta: Meta = {
  title: "react-essentials/useDelta",
  parameters: {
    docs: {
      page: docs,
    },
  },
};

export default meta;

export const Default: StoryObj = {
  render: function Default() {
    const [value, setValue] = useState(0);
    const delta = useDelta(value);

    return (
      <>
        <Column gap="1rem">
          <Monospace>value: {value}</Monospace>
          <Row gap="1rem">
            <Button onClick={() => setValue((count) => count - 1)}>-</Button>
            <Button onClick={() => setValue((count) => count + 1)}>+</Button>
          </Row>
        </Column>
        <DebugOverlay value={{ useDelta: delta }} />
      </>
    );
  },
};

import { Row, SymbolButton, Text } from "@codedazur/fusion-ui";
import { useDelta } from "@codedazur/react-essentials";
import { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { DebugOverlay } from "../../components/DebugOverlay";
import docs from "./useDelta.docs.mdx";

const meta: Meta = {
  title: "React/Essentials/useDelta",
  parameters: {
    docs: {
      page: docs,
    },
  },
};

export default meta;

export const Default: StoryObj = {
  render: function Default() {
    const [value, setValue] = useState(1);
    const delta = useDelta(value);

    return (
      <>
        <Row gap={400}>
          {[1, 2, 3, 4, 5].map((target) => (
            <SymbolButton
              variant="tertiary"
              key={target}
              onClick={() => setValue(target)}
              disabled={value === target}
            >
              <Text font={5}>{target}</Text>
            </SymbolButton>
          ))}
        </Row>
        <DebugOverlay value={{ useDelta: delta }} />
      </>
    );
  },
};

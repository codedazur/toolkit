import { Button, Column, Row } from "@codedazur/react-components";
import { useDelta } from "@codedazur/react-essentials";
import { Meta, StoryObj } from "@storybook/react";
import { Dispatch, SetStateAction, useState } from "react";
import { DebugOverlay } from "../../components/DebugOverlay";
import { Monospace } from "../../components/Monospace";
import docs from "./useDelta.docs.mdx";

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
    const [value, setValue] = useState(1);
    const delta = useDelta(value);

    return (
      <>
        <Row gap="1rem">
          {[1, 2, 3, 4, 5].map((target) => (
            <Button
              onClick={() => setValue(target)}
              disabled={value === target}
            >
              {target}
            </Button>
          ))}
        </Row>
        <DebugOverlay value={{ useDelta: delta }} />
      </>
    );
  },
};

import { Button, Center, Column, Row } from "@codedazur/fusion-ui";
import { useSize } from "@codedazur/react-essentials";
import { Meta, StoryObj } from "@storybook/nextjs";
import { useRef, useState } from "react";
import { DebugOverlay } from "../../components/DebugOverlay";
import { Placeholder } from "../../components/Placeholder";

export default {
  title: "React/Essentials/useSize",
} as Meta;

export const Default = () => {
  const size = useSize();

  return <DebugOverlay value={{ useSize: size }} />;
};

export const WithReference: StoryObj = {
  render: function WithReference() {
    const ref = useRef<HTMLDivElement>(null);
    const size = useSize({ ref });

    return (
      <>
        <Center>
          <Placeholder ref={ref} style={{ width: "50vw", height: "50vh" }} />
        </Center>
        <DebugOverlay value={{ useSize: size }} />
      </>
    );
  },
  parameters: { layout: "centered" },
};

export const WithDynamicReference: StoryObj = {
  render: function WithReference() {
    const refA = useRef<HTMLDivElement>(null);
    const refB = useRef<HTMLDivElement>(null);

    const [ref, setRef] =
      useState<React.RefObject<HTMLDivElement | null> | null>(null);

    const size = useSize({ ref });

    return (
      <>
        <Center>
          <Column gap={400}>
            <Row gap={400}>
              <Placeholder
                ref={refA}
                bordered
                crossed
                style={{ width: "30vw", height: "50vh" }}
              >
                A
              </Placeholder>
              <Placeholder
                ref={refB}
                bordered
                crossed
                style={{ width: "20vw", height: "50vh" }}
              >
                B
              </Placeholder>
            </Row>
            <Row gap={400}>
              <Button onClick={() => setRef(null)} disabled={ref === null}>
                Track Window
              </Button>
              <Button onClick={() => setRef(refA)} disabled={ref === refA}>
                Track A
              </Button>
              <Button onClick={() => setRef(refB)} disabled={ref === refB}>
                Track B
              </Button>
            </Row>
          </Column>
        </Center>
        <DebugOverlay value={{ useSize: size }} />
      </>
    );
  },
  parameters: { layout: "centered" },
};

import {
  Button,
  Center,
  Column,
  Placeholder,
  Row,
} from "@codedazur/react-components";
import { useSize } from "@codedazur/react-essentials";
import { Meta, StoryObj } from "@storybook/react";
import { useRef, useState } from "react";
import { DebugOverlay } from "../../components/DebugOverlay";

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
          <Placeholder ref={ref} bordered crossed width="50vw" height="50vh" />
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

    const [ref, setRef] = useState<React.RefObject<HTMLDivElement> | undefined>(
      undefined,
    );

    const size = useSize({ ref });

    return (
      <>
        <Center>
          <Column gap="1rem">
            <Row gap="1rem">
              <Placeholder
                ref={refA}
                bordered
                crossed
                width="30vw"
                height="50vh"
              >
                A
              </Placeholder>
              <Placeholder
                ref={refB}
                bordered
                crossed
                width="20vw"
                height="50vh"
              >
                B
              </Placeholder>
            </Row>
            <Row gap="1rem">
              <Button
                onClick={() => setRef(undefined)}
                disabled={ref === undefined}
              >
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

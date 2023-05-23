import { Vector2 } from "@codedazur/essentials";
import {
  Button,
  Column,
  Direction,
  LinearProgress,
  LinearProgressBar,
  Placeholder,
  Positioned,
  Row,
  ScrollView,
  SizedBox,
  amber,
  background,
  deepPurple,
  useScroll,
} from "@codedazur/react-components";
import { Meta, StoryObj } from "@storybook/react";
import { motion, transform } from "framer-motion";
import { useMemo, useRef } from "react";
import styled from "styled-components";
import { DebugOverlay } from "../../components/DebugOverlay";

export default {
  title: "react-essentials/useScroll",
  parameters: {
    layout: "fullscreen",
  },
} as Meta;

export const Default = () => {
  const scroll = useScroll();

  return (
    <>
      <Placeholder width="150vw" height="150vh" crossed />
      <DebugOverlay value={{ useScroll: scroll }} />
    </>
  );
};

export const WithScrollView: StoryObj = {
  render: () => {
    const ref = useRef<HTMLDivElement>(null);
    const scroll = useScroll(ref);

    return (
      <>
        <ScrollView ref={ref} width="75vw" height="75vh">
          <Placeholder width="100vw" height="100vh" crossed />
        </ScrollView>
        <DebugOverlay value={{ useScroll: scroll }} />
      </>
    );
  },
  parameters: { layout: "centered" },
};

export const WithControls: StoryObj = {
  render: () => {
    const ref = useRef<HTMLDivElement>(null);

    const scroll = useScroll(ref);

    const {
      position,
      progress,
      setPosition,
      addPosition,
      setProgress,
      addProgress,
    } = scroll;

    const contents = useMemo(
      () => (
        <Row gap="1rem">
          {Array(10)
            .fill(null)
            .map((_, index) => (
              <Placeholder
                key={index}
                width="30rem"
                height="20rem"
                style={{ flexShrink: 0 }}
              />
            ))}
        </Row>
      ),
      []
    );

    return (
      <>
        <SizedBox width="80vw">
          <Column gap="1rem">
            <Row gap="1rem" mainAxisAlignment="center">
              <Button
                disabled={position.x === 1600}
                onClick={() => setPosition(new Vector2(1600, 0))}
              >
                1600px
              </Button>
              <Button
                disabled={progress.x === 0.5}
                onClick={() => setProgress(new Vector2(0.5, 0))}
              >
                50%
              </Button>
            </Row>
            <Row gap="1rem" crossAxisAlignment="center">
              <Column gap="1rem">
                <Button
                  disabled={progress.x === 0}
                  onClick={() => addPosition(Direction.left.multiply(300))}
                >
                  -300px
                </Button>
                <Button
                  disabled={progress.x === 0}
                  onClick={() => addProgress(Direction.left.multiply(0.1))}
                >
                  -10%
                </Button>
              </Column>
              <ScrollView ref={ref}>{contents}</ScrollView>
              <Column gap="1rem">
                <Button
                  disabled={progress.x === 1}
                  onClick={() => addPosition(Direction.right.multiply(300))}
                >
                  +300px
                </Button>
                <Button
                  disabled={progress.x === 1}
                  onClick={() => addProgress(Direction.right.multiply(0.1))}
                >
                  +10%
                </Button>
              </Column>
            </Row>
          </Column>
        </SizedBox>
        <DebugOverlay value={{ useScroll: scroll }} />
      </>
    );
  },
  parameters: {
    layout: "centered",
  },
};

export const WithLinearProgress = () => {
  const scroll = useScroll();

  return (
    <>
      <Positioned mode="fixed" left={0} top={0} right={0}>
        <ScrollProgress
          shape="square"
          height="0.5rem"
          progress={scroll.progress.y}
          transition={{ ease: "easeOut", duration: 0.1 }}
        />
      </Positioned>
      <Placeholder height="150vh" crossed />
      <DebugOverlay value={{ useScroll: scroll }} />
    </>
  );
};

const ScrollProgress = styled(LinearProgress)`
  ${LinearProgressBar} {
    ${background({ color: "primary" })};
  }
`;

export const WithAnimatedBackground = () => {
  const { progress } = useScroll();

  const background = transform(
    progress.y,
    [0, 1],
    [amber[700].toString(), deepPurple[700].toString()]
  );

  return (
    <motion.div style={{ background }}>
      <SizedBox height="200vh" />
    </motion.div>
  );
};

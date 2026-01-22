import { Vector2 } from "@codedazur/essentials";
import { Box, Button, Column, LinearProgress, Row } from "@codedazur/fusion-ui";
import { useScroll } from "@codedazur/react-essentials";
import { Meta, StoryObj } from "@storybook/nextjs";
import { motion, transform } from "framer-motion";
import { useMemo, useRef } from "react";
import { DebugOverlay } from "../../components/DebugOverlay";
import { Placeholder } from "../../components/Placeholder/Placeholder";
import docs from "./useScroll.docs.md";

export default {
  title: "React/Essentials/useScroll",
  parameters: {
    layout: "fullscreen",
    docs: {
      page: docs,
    },
  },
} as Meta;

export const Default = () => {
  const scroll = useScroll();

  return (
    <>
      <Placeholder style={{ width: "150vw", height: "150vh" }} />
      <ScrollDebugOverlay scroll={scroll} />
    </>
  );
};

export const WithReference: StoryObj = {
  render: function WithScrollView() {
    const ref = useRef<HTMLDivElement>(null);
    const scroll = useScroll({ ref });

    return (
      <>
        <Box
          ref={ref}
          style={{ width: "75vw", height: "75vh" }}
          overflow="auto"
        >
          <Placeholder style={{ width: "100vw", height: "100vh" }} />
        </Box>
        <ScrollDebugOverlay scroll={scroll} />
      </>
    );
  },
  parameters: { layout: "centered" },
};

export const WithControls: StoryObj = {
  render: function WithControls() {
    const ref = useRef<HTMLDivElement>(null);
    const scroll = useScroll({ ref });
    const scrollProgress = scroll.useProgress();

    const {
      position,
      progress,
      setPosition,
      addPosition,
      setProgress,
      addProgress,
    } = { ...scroll, ...scrollProgress };

    const contents = useMemo(
      () => (
        <Row gap={400}>
          {Array(10)
            .fill(null)
            .map((_, index) => (
              <Placeholder
                key={index}
                size={{ width: 800, height: 700 }}
                flex={{ shrink: 0 }}
              />
            ))}
        </Row>
      ),
      [],
    );

    return (
      <>
        <div style={{ width: "80vw" }}>
          <Column gap={400}>
            <Row gap={400} justify="center">
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
            <Row gap={400} align="center">
              <Column gap={400}>
                <Button
                  disabled={progress.x === 0}
                  onClick={() => addPosition(new Vector2(-1, 0).multiply(300))}
                >
                  -300px
                </Button>
                <Button
                  disabled={progress.x === 0}
                  onClick={() => addProgress(new Vector2(-1, 0).multiply(0.1))}
                >
                  -10%
                </Button>
              </Column>
              <Box ref={ref} overflow="auto">
                {contents}
              </Box>
              <Column gap={400}>
                <Button
                  disabled={progress.x === 1}
                  onClick={() => addPosition(new Vector2(1, 0).multiply(300))}
                >
                  +300px
                </Button>
                <Button
                  disabled={progress.x === 1}
                  onClick={() => addProgress(new Vector2(1, 0).multiply(0.1))}
                >
                  +10%
                </Button>
              </Column>
            </Row>
          </Column>
        </div>
        <ScrollDebugOverlay scroll={scroll} />
      </>
    );
  },
  parameters: {
    layout: "centered",
  },
};

export const WithLinearProgress = () => {
  const scroll = useScroll();
  const { progress } = scroll.useProgress();

  return (
    <>
      <LinearProgress
        progress={progress.y}
        transition={{ ease: "easeOut", duration: 0.1 }}
        position="fixed"
      />
      <Placeholder style={{ height: "150vh" }} />
      <ScrollDebugOverlay scroll={scroll} />
    </>
  );
};

export const WithAnimatedBackground = () => {
  const scroll = useScroll();
  const { progress } = scroll.useProgress();

  const background = transform(progress.y, [0, 1], ["#993333", "#333399"]);
  console.log(background);

  return (
    <>
      <motion.div style={{ background }}>
        <Box style={{ height: "200vh" }} />
      </motion.div>
      <ScrollDebugOverlay scroll={scroll} />
    </>
  );
};

function ScrollDebugOverlay({
  scroll,
}: {
  scroll: ReturnType<typeof useScroll>;
}) {
  const progress = scroll.useProgress();

  return (
    <DebugOverlay value={{ useScroll: { ...scroll, useProgress: progress } }} />
  );
}

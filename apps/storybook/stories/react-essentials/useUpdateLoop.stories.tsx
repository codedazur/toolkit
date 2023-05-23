import {
  Column,
  IconButton,
  PauseIcon,
  PlayArrowIcon,
  Row,
  ShapedBox,
  StopIcon,
  background,
  shape,
  size,
} from "@codedazur/react-components";
import { Frame, useUpdateLoop } from "@codedazur/react-essentials";
import { Meta, StoryObj } from "@storybook/react";
import { useEffect, useMemo, useRef, useState } from "react";
import { DebugOverlay } from "../../components/DebugOverlay";
import docs from "./useUpdateLoop.docs.mdx";
import styled from "styled-components";

interface UseUpateLoopArgs {
  timeScale?: number;
  targetFps?: number;
}

const meta: Meta<UseUpateLoopArgs> = {
  title: "react-essentials/useUpdateLoop",
  parameters: {
    docs: {
      page: docs,
    },
  },
  argTypes: {
    timeScale: { control: { type: "range", min: 0, max: 2, step: 0.1 } },
    targetFps: { control: { type: "number", min: 0.1, max: 240 } },
  },
  args: {
    timeScale: 1,
    targetFps: undefined,
  },
};

export default meta;

export const Default: StoryObj<UseUpateLoopArgs> = {
  render: (args) => {
    const [frame, setFrame] = useState<Frame>();

    const { status, start, pause, stop, isUpdating } = useUpdateLoop({
      onUpdate: setFrame,
      ...args,
    });

    useEffect(() => {
      if (status === "stopped") {
        setFrame(undefined);
      }
    }, [status]);

    const controls = useMemo(
      () => (
        <Row gap="1rem">
          <IconButton onClick={isUpdating ? pause : start}>
            {isUpdating ? <PauseIcon /> : <PlayArrowIcon />}
          </IconButton>
          <IconButton onClick={stop} disabled={status === "stopped"}>
            <StopIcon />
          </IconButton>
        </Row>
      ),
      [status, start, pause, stop, isUpdating]
    );

    return (
      <>
        {controls}
        <DebugOverlay value={{ isUpdating, frame }} />
      </>
    );
  },
};

export const WithAnimation: StoryObj<UseUpateLoopArgs> = {
  render: (args) => {
    const ref = useRef<HTMLDivElement>(null);

    const { status, start, pause, stop, isUpdating } = useUpdateLoop({
      onUpdate: ({ time }) => {
        if (ref.current) {
          ref.current.style.rotate = `${(time * 0.18) % 360}deg`;
        }
      },
      ...args,
    });

    const controls = useMemo(
      () => (
        <Row gap="1rem">
          <IconButton onClick={isUpdating ? pause : start}>
            {isUpdating ? <PauseIcon /> : <PlayArrowIcon />}
          </IconButton>
          <IconButton onClick={stop} disabled={status === "stopped"}>
            <StopIcon />
          </IconButton>
        </Row>
      ),
      [status, start, pause, stop, isUpdating]
    );

    return (
      <Column align="center" gap="3rem">
        <Shape ref={ref} />
        {controls}
      </Column>
    );
  },
};

const Shape = styled.div(
  size("10rem"),
  shape("rounded"),
  background({ color: "primary" })
);

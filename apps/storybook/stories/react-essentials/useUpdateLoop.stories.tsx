import {
  Column,
  IconButton,
  PauseIcon,
  PlayArrowIcon,
  Row,
  StopIcon,
  background,
  shape,
  size,
} from "@codedazur/react-components";
import { Frame, useUpdateLoop } from "@codedazur/react-essentials";
import { Meta, StoryObj } from "@storybook/react-vite";
import { useEffect, useMemo, useRef, useState } from "react";
import styled from "styled-components";
import { DebugOverlay } from "../../components/DebugOverlay";

interface UseUpdateLoopArgs {
  timeScale?: number;
  targetFps?: number;
}

const meta: Meta<UseUpdateLoopArgs> = {
  title: "React/Essentials/useUpdateLoop",
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

export const Default: StoryObj<UseUpdateLoopArgs> = {
  render: function Default(args) {
    const [frame, setFrame] = useState<Frame>();

    const { isUpdating, start, pause, stop } = useUpdateLoop({
      onUpdate: setFrame,
      ...args,
    });

    useEffect(() => {
      if (!isUpdating) {
        setFrame(undefined);
      }
    }, [isUpdating]);

    const controls = useMemo(
      () => (
        <Row gap="1rem">
          <IconButton onClick={isUpdating ? pause : start}>
            {isUpdating ? <PauseIcon /> : <PlayArrowIcon />}
          </IconButton>
          <IconButton onClick={stop}>
            <StopIcon />
          </IconButton>
        </Row>
      ),
      [start, pause, stop, isUpdating],
    );

    return (
      <>
        {controls}
        <DebugOverlay value={{ isUpdating, frame }} />
      </>
    );
  },
};

export const WithAnimation: StoryObj<UseUpdateLoopArgs> = {
  render: function WithAnimation(args) {
    const ref = useRef<HTMLDivElement>(null);

    const { isUpdating, start, pause, stop } = useUpdateLoop({
      onUpdate: ({ time }) => {
        if (ref.current) {
          ref.current.style.rotate = `${(time * 0.18) % 360}deg`;
        }
      },
      onStop: () => {
        if (ref.current) {
          ref.current.style.rotate = `0deg`;
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
          <IconButton onClick={stop}>
            <StopIcon />
          </IconButton>
        </Row>
      ),
      [start, pause, stop, isUpdating],
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
  background({ color: "primary" }),
);

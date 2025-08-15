import { Icon } from "@apps/storybook/components/Icon";
import { Column, IconButton, Row, Surface } from "@codedazur/fusion-ui";
import { Frame, useUpdateLoop } from "@codedazur/react-essentials";
import { Meta, StoryObj } from "@storybook/react-vite";
import { useEffect, useMemo, useRef, useState } from "react";
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
        <Row gap={400}>
          <IconButton
            icon={isUpdating ? Icon.Pause : Icon.Play}
            onClick={isUpdating ? pause : start}
          />
          <IconButton icon={Icon.Stop} onClick={stop} />
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
        <Row gap={400}>
          <IconButton
            icon={isUpdating ? Icon.Pause : Icon.Play}
            onClick={isUpdating ? pause : start}
          />
          <IconButton icon={Icon.Stop} onClick={stop} />
        </Row>
      ),
      [start, pause, stop, isUpdating],
    );

    return (
      <Column align="center" gap={900}>
        <Surface ref={ref} size={600} background={{ color: "primary.base" }} />
        {controls}
      </Column>
    );
  },
};

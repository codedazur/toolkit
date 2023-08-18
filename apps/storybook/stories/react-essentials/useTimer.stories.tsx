import {
  AddIcon,
  background,
  Column,
  IconButton,
  LinearProgress,
  LinearProgressBar,
  PauseIcon,
  PlayArrowIcon,
  RemoveIcon,
  Row,
  shape,
  SkipNextIcon,
  StopIcon,
  Text,
} from "@codedazur/react-components";
import { useTimer, TimerStatus } from "@codedazur/react-essentials";
import { action } from "@storybook/addon-actions";
import { Meta } from "@storybook/react";
import { Bar } from "@apps/storybook/components/Bar";
import styled from "styled-components";
import docs from "./useTimer.docs.mdx";
import { DebugOverlay } from "../../components/DebugOverlay";

const meta: Meta = {
  title: "react-essentials/useTimer",
  parameters: {
    docs: {
      page: docs,
    },
  },
};

export default meta;

export const Default = () => {
  const timer = useTimer(action("callback"), 3000);

  return (
    <Column gap="1rem" align="center">
      <TimerProgress {...timer} />
      <Row gap="1rem">
        <TimerControls {...timer} />
        <TimerExtension {...timer} />
      </Row>
    </Column>
  );
};

interface TimerProgressProps extends ReturnType<typeof useTimer> {}

const TimerProgress = (timer: TimerProgressProps) => {
  const { progress, elapsed, remaining } = timer.useProgress();

  return (
    <>
      <Bar>
        <Text>{elapsed.toString().padStart(4, "0")}</Text>
        <PrimaryLinearProgress
          width="20rem"
          height="0.5rem"
          progress={progress}
        />
        <Text>{timer.duration}</Text>
      </Bar>
      <DebugOverlay
        value={{
          useTimer: {
            ...timer,
            useProgress: { progress, elapsed, remaining },
          },
        }}
      />
    </>
  );
};

const PrimaryLinearProgress = styled(LinearProgress)`
  ${LinearProgressBar} {
    ${background({ color: "primary" })};
    ${shape("stadium")}
  }
`;

interface TimerExtensionProps extends ReturnType<typeof useTimer> {}

const TimerExtension = ({ extend }: TimerExtensionProps) => (
  <Bar>
    <IconButton onClick={() => extend(-1000)}>
      <RemoveIcon />
    </IconButton>
    <IconButton onClick={() => extend(1000)}>
      <AddIcon />
    </IconButton>
  </Bar>
);

interface TimerControlsProps extends ReturnType<typeof useTimer> {}

const TimerControls = ({
  status,
  start,
  resume,
  pause,
  stop,
  end,
}: TimerControlsProps) => {
  const isStopped = status === TimerStatus.stopped;
  const isRunning = status === TimerStatus.running;

  return (
    <Bar>
      {isRunning ? (
        <IconButton onClick={pause}>
          <PauseIcon />
        </IconButton>
      ) : (
        <IconButton onClick={resume}>
          <PlayArrowIcon />
        </IconButton>
      )}
      <IconButton onClick={start}>start</IconButton>
      <IconButton onClick={resume}>resume</IconButton>
      <IconButton onClick={stop}>stop</IconButton>
      <IconButton onClick={stop} disabled={isStopped}>
        <StopIcon />
      </IconButton>
      <IconButton onClick={end}>
        <SkipNextIcon />
      </IconButton>
    </Bar>
  );
};

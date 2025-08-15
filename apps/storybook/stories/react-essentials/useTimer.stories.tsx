import { Bar } from "@apps/storybook/components/Bar";
import { Icon } from "@apps/storybook/components/Icon";
import {
  Button,
  Column,
  IconButton,
  LinearProgress,
  Row,
  Text,
} from "@codedazur/fusion-ui";
import { TimerStatus, useTimer } from "@codedazur/react-essentials";
import { Meta } from "@storybook/react-vite";
import { action } from "storybook/actions";
import { DebugOverlay } from "../../components/DebugOverlay";

const meta: Meta = {
  title: "React/Essentials/useTimer",
};

export default meta;

export const Default = () => {
  const timer = useTimer(action("callback"), 3000);

  return (
    <Column gap={400} align="center">
      <TimerProgress {...timer} />
      <Row gap={400}>
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
        <LinearProgress size={{ width: 800 }} progress={progress} />
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

interface TimerExtensionProps extends ReturnType<typeof useTimer> {}

const TimerExtension = ({ extend }: TimerExtensionProps) => (
  <Bar>
    <IconButton icon={Icon.Remove} onClick={() => extend(-1000)} />
    <IconButton icon={Icon.Add} onClick={() => extend(1000)} />
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
        <IconButton icon={Icon.Pause} onClick={pause} />
      ) : (
        <IconButton icon={Icon.Play} onClick={resume} />
      )}
      <Button onClick={start}>start</Button>
      <Button onClick={resume}>resume</Button>
      <Button onClick={stop}>stop</Button>
      <IconButton icon={Icon.Stop} onClick={stop} disabled={isStopped} />
      <IconButton icon={Icon.SkipNext} onClick={end} />
    </Bar>
  );
};

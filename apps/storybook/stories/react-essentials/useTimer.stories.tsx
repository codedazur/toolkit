import { Bar } from "@apps/storybook/components/Bar";
import { Icon } from "@apps/storybook/components/Icon";
import {
  Column,
  IconButton,
  LinearProgress,
  Row,
  Text,
} from "@codedazur/fusion-ui";
import { TimerStatus, useTimer } from "@codedazur/react-essentials";
import { Meta } from "@storybook/nextjs";
import { action } from "storybook/actions";
import { DebugOverlay } from "../../components/DebugOverlay";

const meta: Meta = {
  title: "React/Essentials/useTimer",
};

export default meta;

export const Default = () => {
  const timer = useTimer(action("callback"), 4000);

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

type TimerProgressProps = ReturnType<typeof useTimer>;

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

type TimerExtensionProps = ReturnType<typeof useTimer>;

const TimerExtension = ({ extend }: TimerExtensionProps) => (
  <Bar>
    <IconButton
      size="small"
      variant="tertiary"
      icon={Icon.Remove}
      onClick={() => extend(-1000)}
    />
    <IconButton
      size="small"
      variant="tertiary"
      icon={Icon.Add}
      onClick={() => extend(1000)}
    />
  </Bar>
);

type TimerControlsProps = ReturnType<typeof useTimer>;

const TimerControls = ({
  status,
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
        <IconButton
          size="small"
          variant="tertiary"
          icon={Icon.Pause}
          onClick={pause}
        />
      ) : (
        <IconButton
          size="small"
          variant="tertiary"
          icon={Icon.Play}
          onClick={resume}
        />
      )}
      <IconButton
        size="small"
        variant="tertiary"
        icon={Icon.Stop}
        onClick={stop}
        disabled={isStopped}
      />
      <IconButton
        size="small"
        variant="tertiary"
        icon={Icon.SkipNext}
        onClick={end}
      />
    </Bar>
  );
};

import {
  AddIcon,
  Center,
  Column,
  IconButton,
  LinearProgress,
  PauseIcon,
  PlayArrowIcon,
  Positioned,
  RemoveIcon,
  Row,
  SkipNextIcon,
  StopIcon,
  Text,
  Transform,
} from "@codedazur/react-components";
import { useTimer } from "@codedazur/react-essentials";
import { action } from "@storybook/addon-actions";
import { Bar } from "../../components/Bar";
import { meta } from "../../utilities/meta";
import { story } from "../../utilities/story";
import docs from "./useTimer.docs.mdx";

export default meta({
  parameters: {
    docs: {
      page: docs,
    },
  },
});

export const Default = story(() => {
  const timer = useTimer(action("callback"), 3000);

  return (
    <Center>
      <Column gap="1rem" align="center">
        <TimerProgress {...timer} />
        <Row gap="1rem">
          <TimerControls {...timer} />
          <TimerExtension {...timer} />
        </Row>
      </Column>
    </Center>
  );
});

interface TimerProgressProps extends ReturnType<typeof useTimer> {}

const TimerProgress = ({ useProgress }: TimerProgressProps) => {
  const { elapsed, progress, duration } = useProgress();

  return (
    <Bar>
      <Text>{elapsed.toString().padStart(4, "0")}</Text>
      <LinearProgress width="20rem" height="0.5rem" progress={progress} />
      <Text>{duration}</Text>
    </Bar>
  );
};

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
  isRunning,
  resume,
  pause,
  stop,
  isStopped,
  end,
}: TimerControlsProps) => (
  <Bar>
    {!isRunning ? (
      <IconButton onClick={resume}>
        <PlayArrowIcon />
      </IconButton>
    ) : (
      <IconButton onClick={pause}>
        <PauseIcon />
      </IconButton>
    )}
    <IconButton onClick={stop} disabled={isStopped}>
      <StopIcon />
    </IconButton>
    <IconButton onClick={end}>
      <SkipNextIcon />
    </IconButton>
  </Bar>
);

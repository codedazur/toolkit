import {
  AddIcon,
  Center,
  Column,
  IconButton,
  LinearProgress,
  PauseIcon,
  PlayArrowIcon,
  Row,
  SkipNextIcon,
  StopIcon,
  Text,
  Transform,
} from "@codedazur/react-components";
import { useTimer } from "@codedazur/react-essentials";
import { action } from "@storybook/addon-actions";
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
  const { isPaused, resume, pause, stop, extend, end, useProgress } = useTimer(
    action("callback"),
    3000
  );

  return (
    <Center>
      <Column gap="1rem" width="20rem" maxWidth="100%">
        <TimerProgress useProgress={useProgress} />
        <Row gap="1rem" justify="center">
          {isPaused ? (
            <IconButton onClick={resume}>
              <PlayArrowIcon />
            </IconButton>
          ) : (
            <IconButton onClick={pause}>
              <PauseIcon />
            </IconButton>
          )}
          <IconButton onClick={stop}>
            <StopIcon />
          </IconButton>
          <IconButton onClick={() => extend(1000)}>
            <AddIcon />
          </IconButton>
          <IconButton onClick={end}>
            <SkipNextIcon />
          </IconButton>
        </Row>
      </Column>
    </Center>
  );
});

interface TimerProgressProps {
  useProgress: ReturnType<typeof useTimer>["useProgress"];
}

const TimerProgress = ({ useProgress }: TimerProgressProps) => {
  const { progress, elapsed, duration } = useProgress();

  return (
    <Row gap="1rem" align="center">
      <Text>0</Text>
      <LinearProgress
        width="20rem"
        progress={progress}
        label={<Transform translateY="-1.5rem">{elapsed.toFixed(0)}</Transform>}
      />
      <Text>{duration}</Text>
    </Row>
  );
};

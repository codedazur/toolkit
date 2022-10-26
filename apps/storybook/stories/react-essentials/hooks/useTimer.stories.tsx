import {
  AddIcon,
  Column,
  IconButton,
  LinearProgress,
  PauseIcon,
  PlayArrowIcon,
  Row,
  StopIcon,
  Text,
} from "@codedazur/react-components";
import { useTimer } from "@codedazur/react-essentials";
import { meta } from "../../../utilities/meta";
import { story } from "../../../utilities/story";
import docs from "./useTimer.docs.mdx";

export default meta({
  parameters: {
    docs: {
      page: docs,
    },
  },
});

export const Default = story(() => {
  const { isPaused, resume, pause, stop, extend, useProgress } = useTimer(
    () => alert("Time's up!"),
    3000
  );

  const { progress, elapsed, remaining } = useProgress();

  return (
    <Column gap="1rem">
      <Row justify="space-between">
        <Text>{elapsed.toFixed(0)}</Text>
        <Text>{remaining.toFixed(0)}</Text>
      </Row>
      <LinearProgress progress={progress} />
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
      </Row>
    </Column>
  );
});

import { Timer } from "@codedazur/essentials";
import {
  AddIcon,
  Column,
  IconButton,
  PauseIcon,
  PlayArrowIcon,
  Row,
  StopIcon,
} from "@codedazur/react-components";
import { meta } from "../../../utilities/meta";
import { story } from "../../../utilities/story";
import docs from "./Timer.docs.mdx";

export default meta({
  parameters: {
    docs: {
      page: docs,
    },
  },
});

const timer = new Timer(() => alert("Time's up!"), 3000);

export const Default = story(() => (
  <Column gap="1rem">
    <Row gap="1rem" justify="center">
      {timer.isPaused() ? (
        <IconButton onClick={timer.resume}>
          <PlayArrowIcon />
        </IconButton>
      ) : (
        <IconButton onClick={timer.pause}>
          <PauseIcon />
        </IconButton>
      )}
      <IconButton onClick={timer.stop}>
        <StopIcon />
      </IconButton>
      <IconButton onClick={() => timer.extend(1000)}>
        <AddIcon />
      </IconButton>
    </Row>
  </Column>
));

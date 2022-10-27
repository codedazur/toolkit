import { Timer } from "@codedazur/essentials";
import { Button, Center, Row } from "@codedazur/react-components";
import { action } from "@storybook/addon-actions";
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

const timer = new Timer(action("callback"), 3000);

timer.addEventListener("start", action("start"));
timer.addEventListener("stop", action("stop"));
timer.addEventListener("pause", action("pause"));
timer.addEventListener("resume", action("resume"));
timer.addEventListener("extend", action("extend"));
timer.addEventListener("end", action("end"));

export const Default = story(() => (
  <Center>
    <Row gap="1rem">
      <Button onClick={timer.start}>Start</Button>
      <Button onClick={timer.pause}>Pause</Button>
      <Button onClick={timer.resume}>Resume</Button>
      <Button onClick={timer.stop}>Stop</Button>
      <Button onClick={() => timer.extend(1000)}>Extend</Button>
      <Button onClick={timer.end}>End</Button>
    </Row>
  </Center>
));

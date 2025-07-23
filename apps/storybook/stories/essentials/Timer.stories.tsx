import { Timer, TimerEvent } from "@codedazur/essentials";
import { Button, Center, Column, Row } from "@codedazur/react-components";
import { action } from "storybook/actions";
import type { Meta, StoryObj } from "@storybook/react-vite";

const meta: Meta<Timer> = {
  title: "Essentials/Timer",
};

export default meta;

const timer = new Timer(action("callback"), 3000);

timer.addEventListener(TimerEvent.start, action("start"));
timer.addEventListener(TimerEvent.stop, action("stop"));
timer.addEventListener(TimerEvent.pause, action("pause"));
timer.addEventListener(TimerEvent.resume, action("resume"));
timer.addEventListener(TimerEvent.end, action("end"));

type Story = StoryObj<typeof Timer>;

export const Default: Story = {
  render: () => (
    <Center>
      <Column gap="2rem">
        <Row gap="1rem" justify="center">
          <Button onClick={timer.start}>Start</Button>
          <Button onClick={timer.stop}>Stop</Button>
        </Row>
        <Row gap="1rem" justify="center">
          <Button onClick={timer.pause}>Pause</Button>
          <Button onClick={timer.resume}>Resume</Button>
        </Row>
        <Row gap="1rem" justify="center">
          <Button onClick={() => timer.extend(1000)}>Extend</Button>
          <Button onClick={timer.end}>End</Button>
        </Row>
      </Column>
    </Center>
  ),
};

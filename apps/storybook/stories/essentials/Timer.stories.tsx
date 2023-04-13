import { Timer } from "@codedazur/essentials";
import { Button, Center, Column, Row } from "@codedazur/react-components";
import { action } from "@storybook/addon-actions";
import type { Meta, StoryObj } from "@storybook/react";
import docs from "./Timer.docs.mdx";

const meta: Meta<Timer> = {
  title: "Essentials/Timer",
  parameters: {
    docs: {
      page: docs,
    },
  },
};

export default meta;

const timer = new Timer(action("callback"), 3000);

timer.addEventListener("start", action("start"));
timer.addEventListener("stop", action("stop"));
timer.addEventListener("pause", action("pause"));
timer.addEventListener("resume", action("resume"));
timer.addEventListener("extend", action("extend"));
timer.addEventListener("end", action("end"));

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

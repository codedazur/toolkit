import {
  Button,
  Column,
  LinearProgress,
  Placeholder,
  Row,
  Text,
} from "@codedazur/react-components";
import { useUpdateLoop } from "@codedazur/react-essentials";
import {
  NotificationProps,
  NotificationsProvider,
  useNotifications,
} from "@codedazur/react-notifications";
import { FunctionComponent, useState } from "react";
import { story } from "../utilities/story";

export default {
  title: "Notifications/useNotifications",
};

export const Default = story(() => (
  <NotificationsProvider>
    <AddButton />
    <Notifications />
  </NotificationsProvider>
));

const AddButton = () => {
  const { addNotification } = useNotifications();

  return (
    <Button onClick={() => addNotification(<Text>Hello world!</Text>)}>
      Add Notification
    </Button>
  );
};

const Notifications = () => {
  const { notifications } = useNotifications();

  return (
    <Column gap="1rem">
      {notifications.map((notification) => (
        <Notification key={notification.id} {...notification} />
      ))}
    </Column>
  );
};

const Notification: FunctionComponent<NotificationProps> = ({
  id,
  element,
  timer, // @todo remove the timer in favor of pause/resume props
  dismiss,
  // useProgress, @todo
}) => {
  const [progress, setProgress] = useState(timer.progress);

  useUpdateLoop({
    onUpdate: () => setProgress(timer.progress),
    targetFps: 10,
  });

  return (
    <Placeholder onMouseEnter={timer.pause} onMouseLeave={timer.resume}>
      <Column>
        <Row>
          {element}
          <Button onClick={dismiss}>Dismiss</Button>
        </Row>
        <LinearProgress progress={progress} />
      </Column>
    </Placeholder>
  );
};

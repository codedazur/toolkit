import {
  Button,
  Column,
  EdgeInset,
  LinearProgress,
  Placeholder,
  Portal,
  Positioned,
  Row,
} from "@codedazur/react-components";
import {
  NotificationProps,
  NotificationsProvider,
  useNotifications,
} from "@codedazur/react-notifications";
import { faker } from "@faker-js/faker";
import { FunctionComponent } from "react";
import { meta } from "../../../utilities/meta";
import { story } from "../../../utilities/story";
import docs from "./useNotifications.docs.mdx";

export default meta({
  parameters: {
    docs: {
      page: docs,
    },
  },
});

export const Default = story(() => (
  <NotificationsProvider>
    <AddNotificationButton />
    <NotificationList />
  </NotificationsProvider>
));

const AddNotificationButton = () => {
  const { addNotification } = useNotifications();

  return (
    <Button onClick={() => addNotification(faker.lorem.sentence())}>
      Add Notification
    </Button>
  );
};

const NotificationList = () => {
  const { notifications } = useNotifications();

  return (
    <Portal>
      <Positioned bottom="1rem" right="1rem">
        <Column gap="1rem" align="flex-end">
          {notifications.map((notification) => (
            <Notification key={notification.id} {...notification} />
          ))}
        </Column>
      </Positioned>
    </Portal>
  );
};

const Notification: FunctionComponent<NotificationProps> = ({
  children,
  timer,
  dismiss,
  useProgress,
}) => (
  <Placeholder
    width="auto"
    onMouseEnter={timer.pause}
    onMouseLeave={timer.resume}
  >
    <Column width="100%">
      <EdgeInset all="0.5rem" left="1rem">
        <Row justify="space-between" align="center" gap="1rem">
          {children}
          <Button onClick={dismiss}>Dismiss</Button>
        </Row>
      </EdgeInset>
      <NotificationProgress useProgress={useProgress} />
    </Column>
  </Placeholder>
);

const NotificationProgress = ({
  useProgress,
}: Pick<NotificationProps, "useProgress">) => {
  const { progress } = useProgress();

  return <LinearProgress progress={progress} height="2px" shape="square" />;
};

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
import { FunctionComponent, ReactNode } from "react";
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

export const Persistent = story(() => (
  <NotificationsProvider autoDismiss={false}>
    <AddNotificationButton />
    <NotificationList />
  </NotificationsProvider>
));

export const MixedDurations = story(() => (
  <NotificationsProvider>
    <Row gap="1rem">
      <AddNotificationButton autoDismiss={2500}>
        Add Fast Notification
      </AddNotificationButton>
      <AddNotificationButton>Add Normal Notification</AddNotificationButton>
      <AddNotificationButton autoDismiss={10000}>
        Add Slow Notification
      </AddNotificationButton>
      <AddNotificationButton autoDismiss={false}>
        Add Persistent Notification
      </AddNotificationButton>
    </Row>
    <NotificationList />
  </NotificationsProvider>
));

export const Groups = story(() => (
  <NotificationsProvider>
    <Column gap="1rem">
      <Banners />
      <Row gap="1rem">
        <AddBannerButton />
        <AddSnackbarButton />
      </Row>
    </Column>
    <Snackbars />
  </NotificationsProvider>
));

const AddNotificationButton = ({
  group,
  autoDismiss,
  children = "Add Notification",
}: {
  group?: string;
  autoDismiss?: number | false;
  children?: ReactNode;
}) => {
  const { addNotification } = useNotifications(group);

  return (
    <Button
      onClick={() => addNotification(faker.lorem.sentence(), { autoDismiss })}
    >
      {children}
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
    onMouseEnter={timer?.pause}
    onMouseLeave={timer?.resume}
  >
    <Column width="100%">
      <EdgeInset all="0.5rem" left="1rem">
        <Row justify="space-between" align="center" gap="1rem">
          {children}
          <Button onClick={dismiss}>Dismiss</Button>
        </Row>
      </EdgeInset>
      {timer && <NotificationProgress useProgress={useProgress} />}
    </Column>
  </Placeholder>
);

const NotificationProgress = ({
  useProgress,
}: Pick<NotificationProps, "useProgress">) => {
  const { progress } = useProgress();

  return <LinearProgress progress={progress} height="2px" shape="square" />;
};

const AddBannerButton = () => {
  const { addNotification } = useNotifications("banners");

  return (
    <Button
      onClick={() =>
        addNotification(faker.lorem.sentence(), { autoDismiss: false })
      }
    >
      Add Banner
    </Button>
  );
};

const AddSnackbarButton = () => {
  const { addNotification } = useNotifications("snackbars");

  return (
    <Button onClick={() => addNotification(faker.lorem.sentence())}>
      Add Snackbar
    </Button>
  );
};

const Snackbars = () => {
  const { notifications } = useNotifications("snackbars");

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

const Banners = () => {
  const { notifications } = useNotifications("banners");

  if (notifications.length <= 0) {
    return null;
  }

  return (
    <Column gap="0.5rem">
      {notifications.map((notification) => (
        <Notification key={notification.id} {...notification} />
      ))}
    </Column>
  );
};

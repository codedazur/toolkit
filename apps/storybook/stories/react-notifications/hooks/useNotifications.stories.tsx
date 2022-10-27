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
  <NotificationsProvider limit={3}>
    <AddNotificationButton />
    <NotificationList />
  </NotificationsProvider>
));

export const Persistent = story(() => (
  <NotificationsProvider autoDismiss={false} limit={3}>
    <AddNotificationButton />
    <NotificationList />
  </NotificationsProvider>
));

export const MixedDurations = story(() => (
  <NotificationsProvider limit={3}>
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

enum NotificationGroup {
  banners = "banners",
  snackbars = "snackbars",
}

export const Groups = story(() => (
  <NotificationsProvider
    limit={{ [NotificationGroup.snackbars]: 3 }}
    autoDismiss={{ [NotificationGroup.banners]: false }}
  >
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

function useSnackbars() {
  const {
    notifications: snackbars,
    addNotification: addSnackbar,
    removeNotification: removeSnackbar,
  } = useNotifications(NotificationGroup.snackbars);

  return {
    snackbars,
    addSnackbar,
    removeSnackbar,
  };
}

function useBanners() {
  const {
    notifications: banners,
    addNotification: addBanner,
    removeNotification: removeBanner,
  } = useNotifications(NotificationGroup.banners);

  return {
    banners,
    addBanner,
    removeBanner,
  };
}

const AddBannerButton = () => {
  const { addBanner } = useBanners();

  return (
    <Button onClick={() => addBanner(faker.lorem.sentence())}>
      Add Banner
    </Button>
  );
};

const AddSnackbarButton = () => {
  const { addSnackbar } = useSnackbars();

  return (
    <Button onClick={() => addSnackbar(faker.lorem.sentence())}>
      Add Snackbar
    </Button>
  );
};

const Snackbars = () => {
  const { snackbars } = useSnackbars();

  return (
    <Portal>
      <Positioned bottom="1rem" right="1rem">
        <Column gap="1rem" align="flex-end">
          {snackbars.map((snackbar) => (
            <Notification key={snackbar.id} {...snackbar} />
          ))}
        </Column>
      </Positioned>
    </Portal>
  );
};

const Banners = () => {
  const { banners } = useBanners();

  if (banners.length <= 0) {
    return null;
  }

  return (
    <Column gap="0.5rem">
      {banners.map((banner) => (
        <Notification key={banner.id} {...banner} />
      ))}
    </Column>
  );
};

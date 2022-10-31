import {
  AbsorbPointer,
  Badge,
  Button,
  Center,
  Column,
  EdgeInset,
  LinearProgress,
  Placeholder,
  Portal,
  Positioned,
  Row,
  UnfoldLessIcon,
} from "@codedazur/react-components";
import {
  NotificationProps,
  NotificationsProvider,
  useNotifications,
} from "@codedazur/react-notifications";
import { faker } from "@faker-js/faker";
import { FunctionComponent, ReactNode } from "react";
import { meta } from "../../utilities/meta";
import { story } from "../../utilities/story";
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
    <Center>
      <AddNotificationButton />
    </Center>
    <NotificationList />
  </NotificationsProvider>
));

export const Limited = story(() => (
  <NotificationsProvider limit={3}>
    <Center>
      <AddNotificationButton />
    </Center>
    <NotificationList />
  </NotificationsProvider>
));

export const Persistent = story(() => (
  <NotificationsProvider autoDismiss={false}>
    <Center>
      <AddNotificationButton />
    </Center>
    <NotificationList />
  </NotificationsProvider>
));

export const MixedDurations = story(() => (
  <NotificationsProvider>
    <Center>
      <Row gap="1rem">
        <AddNotificationButton autoDismiss={2500}>Short</AddNotificationButton>
        <AddNotificationButton autoDismiss={5000}>Medium</AddNotificationButton>
        <AddNotificationButton autoDismiss={10000}>Long</AddNotificationButton>
        <AddNotificationButton autoDismiss={false}>
          Persistent
        </AddNotificationButton>
      </Row>
    </Center>
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
  const { add } = useNotifications(group);

  return (
    <Button onClick={() => add(faker.lorem.sentence(), { autoDismiss })}>
      {children}
    </Button>
  );
};

const NotificationList = () => {
  const { entries, queue } = useNotifications();

  return (
    <Portal>
      <AbsorbPointer>
        <Positioned bottom="1rem" right="1rem">
          <Column gap="1rem" align="flex-end">
            {entries.map((notification) => (
              <AbsorbPointer key={notification.id} absorbing={false}>
                <Notification {...notification} />
              </AbsorbPointer>
            ))}
            {queue.length > 0 && (
              <Badge count={queue.length}>
                <Placeholder width="2.5rem" height="2.5rem">
                  <UnfoldLessIcon />
                </Placeholder>
              </Badge>
            )}
          </Column>
        </Positioned>
      </AbsorbPointer>
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

  return <LinearProgress progress={1 - progress} height="1px" shape="square" />;
};

export const Groups = story(() => (
  <NotificationsProvider
    autoDismiss={{ banners: false }}
    limit={{ banners: 1, snackbars: 3 }}
  >
    <Column gap="1rem" height="100%">
      <Banners />
      <Center>
        <Row gap="1rem">
          <AddBannerButton />
          <AddSnackbarButton />
        </Row>
      </Center>
    </Column>
    <Snackbars />
  </NotificationsProvider>
));

function useSnackbars() {
  const { entries, ...notifications } = useNotifications("snackbars");

  return {
    snackbars: entries,
    ...notifications,
  };
}

function useBanners() {
  const { entries, ...notifications } = useNotifications("banners");

  return {
    banners: entries,
    ...notifications,
  };
}

const AddBannerButton = () => {
  const { add } = useBanners();

  return (
    <Button onClick={() => add(faker.lorem.sentence())}>Add Banner</Button>
  );
};

const AddSnackbarButton = () => {
  const { add } = useSnackbars();

  return (
    <Button onClick={() => add(faker.lorem.sentence())}>Add Snackbar</Button>
  );
};

const Snackbars = () => {
  const { snackbars, queue } = useSnackbars();

  return (
    <Portal>
      <AbsorbPointer>
        <Positioned bottom="1rem" right="1rem">
          <Column gap="1rem" align="flex-end">
            {snackbars.map((snackbar) => (
              <AbsorbPointer key={snackbar.id} absorbing={false}>
                <Notification {...snackbar} />
              </AbsorbPointer>
            ))}
            {queue.length > 0 && (
              <Placeholder width="2.5rem" height="2.5rem">
                +{queue.length}
              </Placeholder>
            )}
          </Column>
        </Positioned>
      </AbsorbPointer>
    </Portal>
  );
};

const Banners = () => {
  const { banners, queue } = useBanners();

  if (banners.length <= 0) {
    return null;
  }

  return (
    <Portal>
      <AbsorbPointer>
        <Positioned top="1rem" left="1rem" right="1rem">
          <Column reverse gap="0.5rem">
            {banners.map((banner) => (
              <AbsorbPointer key={banner.id} absorbing={false}>
                <Notification {...banner} />
              </AbsorbPointer>
            ))}
            {queue.length > 0 && (
              <Placeholder width="2.5rem" height="2.5rem">
                +{queue.length}
              </Placeholder>
            )}
          </Column>
        </Positioned>
      </AbsorbPointer>
    </Portal>
  );
};

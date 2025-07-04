import { Button } from "@apps/storybook/components/Button";
import {
  AbsorbPointer,
  Center,
  Column,
  EdgeInset,
  LinearProgress,
  Placeholder,
  Portal,
  Positioned,
  Row,
} from "@codedazur/react-components";
import { useTimerProgress } from "@codedazur/react-essentials";
import {
  NotificationProps,
  NotificationsProvider,
  useNotifications,
} from "@codedazur/react-notifications";
import { faker } from "@faker-js/faker";
import { expect } from "@storybook/jest";
import { Meta, StoryObj } from "@storybook/react";
import { userEvent, within } from "@storybook/testing-library";
import { FunctionComponent, ReactNode } from "react";

const meta: Meta = {
  title: "React/Notifications/NotificationsProvider",
};

export default meta;

export const Default: StoryObj = {
  render: () => (
    <NotificationsProvider>
      <Center>
        <AddNotificationButton />
      </Center>
      <Notifications />
    </NotificationsProvider>
  ),
  play: async ({ canvasElement }) => {
    const body = within(canvasElement.ownerDocument.body);
    const button = await body.findByRole("button");
    userEvent.click(button);

    const notification = await body.findByTestId("notification");
    expect(notification).toBeInTheDocument();
  },
};

export const Limited: StoryObj = {
  render: () => (
    <NotificationsProvider limit={3}>
      <Center>
        <AddNotificationButton />
      </Center>
      <Notifications />
    </NotificationsProvider>
  ),
  play: async ({ canvasElement }) => {
    const body = within(canvasElement.ownerDocument.body);

    const button = await body.findByRole("button");
    for (let i = 0; i < 4; i++) {
      userEvent.click(button);
    }

    const notifications = await body.findAllByTestId("notification");
    expect(notifications.length).toEqual(3);
  },
};

export const Persistent: StoryObj = {
  render: () => (
    <NotificationsProvider autoDismiss={false}>
      <Center>
        <AddNotificationButton />
      </Center>
      <Notifications />
    </NotificationsProvider>
  ),
  play: async ({ canvasElement }) => {
    const body = within(canvasElement.ownerDocument.body);

    const button = await body.findByRole("button");
    userEvent.click(button);
  },
};

export const MixedDurations: StoryObj = {
  render: () => (
    <NotificationsProvider>
      <Center>
        <Row gap="1rem">
          <AddNotificationButton autoDismiss={2500}>
            Short
          </AddNotificationButton>
          <AddNotificationButton autoDismiss={5000}>
            Medium
          </AddNotificationButton>
          <AddNotificationButton autoDismiss={10000}>
            Long
          </AddNotificationButton>
        </Row>
      </Center>
      <Notifications />
    </NotificationsProvider>
  ),

  play: async ({ canvasElement }) => {
    const body = within(canvasElement.ownerDocument.body);

    const buttons = await body.findAllByRole("button");
    for (const button of buttons) {
      userEvent.click(button);
    }
  },
};

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

const Notifications = () => {
  const { entries, queue } = useNotifications();

  return (
    <Portal>
      <AbsorbPointer>
        <Positioned bottom="1rem" right="1rem">
          <Column gap="1rem" align="flex-end">
            {entries.map(({ id, notification }) => (
              <AbsorbPointer key={id} absorbing={false}>
                <Notification {...notification} />
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

const Notification: FunctionComponent<NotificationProps> = ({
  children,
  timer,
  onDismiss,
}) => (
  <Placeholder
    width="auto"
    onMouseEnter={timer?.pause}
    onMouseLeave={timer?.resume}
    data-testid="notification"
  >
    <Column width="100%">
      <EdgeInset all="0.5rem" left="1rem">
        <Row justify="space-between" align="center" gap="1rem">
          {children}
          {onDismiss && <Button onClick={onDismiss}>Dismiss</Button>}
        </Row>
      </EdgeInset>
      {timer && <NotificationProgress timer={timer} />}
    </Column>
  </Placeholder>
);

const NotificationProgress = ({
  timer,
}: Pick<Required<NotificationProps>, "timer">) => {
  const { progress } = useTimerProgress(timer);

  return <LinearProgress progress={1 - progress} height="1px" shape="square" />;
};

export const Groups: StoryObj = {
  render: () => (
    <NotificationsProvider
      autoDismiss={{ banners: false }}
      limit={{ banners: 1, snackbars: 3 }}
    >
      <Column gap="1rem" height="100%">
        <Banners />
        <Center>
          <Column gap="3rem" align="center">
            <Row gap="1rem">
              <AddBannerButton />
              <ClearBannersButton />
            </Row>
            <Row gap="1rem">
              <AddSnackbarButton />
              <ClearSnackbarsButton />
            </Row>
          </Column>
        </Center>
      </Column>
      <Snackbars />
    </NotificationsProvider>
  ),

  play: async ({ canvasElement }) => {
    const body = within(canvasElement.ownerDocument.body);

    const [addBanner, , addSnackbar] = await body.findAllByRole("button");

    userEvent.click(addBanner);
    const banner = await body.findByTestId("banner");
    expect(banner).toBeInTheDocument();

    userEvent.click(addSnackbar);
    const snackbar = await body.findByTestId("snackbar");
    expect(snackbar).toBeInTheDocument();
  },
};

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

const ClearSnackbarsButton = () => {
  const { clear } = useSnackbars();

  return <Button onClick={() => clear()}>Clear Snackbars</Button>;
};

const ClearBannersButton = () => {
  const { clear } = useBanners();

  return <Button onClick={() => clear()}>Clear Banners</Button>;
};

const Snackbars = () => {
  const { snackbars, queue } = useSnackbars();

  return (
    <Portal>
      <AbsorbPointer>
        <Positioned bottom="1rem" right="1rem">
          <Column gap="1rem" align="flex-end">
            {snackbars.map(({ id, notification }) => (
              <AbsorbPointer key={id} absorbing={false}>
                <Snackbar {...notification} />
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

const Snackbar: FunctionComponent<NotificationProps> = ({
  children,
  timer,
  onDismiss,
}) => (
  <Placeholder
    width="auto"
    onMouseEnter={timer?.pause}
    onMouseLeave={timer?.resume}
    data-testid="snackbar"
  >
    <Column width="100%">
      <EdgeInset all="0.5rem" left="1rem">
        <Row justify="space-between" align="center" gap="1rem">
          {children}
          <Button onClick={onDismiss}>Dismiss</Button>
        </Row>
      </EdgeInset>
      {timer && <NotificationProgress timer={timer} />}
    </Column>
  </Placeholder>
);

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
            {banners.map(({ id, notification }) => (
              <AbsorbPointer key={id} absorbing={false}>
                <Banner {...notification} />
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

const Banner: FunctionComponent<NotificationProps> = ({
  children,
  onDismiss,
}) => (
  <Placeholder width="auto" data-testid="banner">
    <Column width="100%">
      <EdgeInset all="0.5rem" left="1rem">
        <Row justify="space-between" align="center" gap="1rem">
          {children}
          <Button onClick={onDismiss}>Dismiss</Button>
        </Row>
      </EdgeInset>
    </Column>
  </Placeholder>
);

import { Origin } from "@codedazur/essentials";
import {
  Button,
  Center,
  Column,
  Icon,
  IconButton,
  Popover,
  ProgressIconButton,
  Row,
} from "@codedazur/fusion-ui";
import { useTimerProgress } from "@codedazur/react-essentials";
import {
  NotificationProps,
  NotificationsProvider,
  useNotifications,
} from "@codedazur/react-notifications";
import { faker } from "@faker-js/faker";
import { Meta, StoryObj } from "@storybook/nextjs";
import { useTransform } from "framer-motion";
import { ReactNode } from "react";
import { expect, userEvent, within } from "storybook/test";
import { Placeholder } from "../../components/Placeholder";

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
        <Row gap={400}>
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
    <Popover
      open={true}
      anchor={{
        strategy: "fixed",
        parent: Origin.bottomRight,
        child: Origin.bottomRight,
        offset: { x: "-1rem", y: "-1rem" },
      }}
      pointerEvents="none"
    >
      <Column gap={400} align="end">
        {entries.map(({ id, notification }) => (
          <Notification key={id} {...notification} />
        ))}
        {queue.length > 0 && (
          <Placeholder size={250}>+{queue.length}</Placeholder>
        )}
      </Column>
    </Popover>
  );
};

/**
 * @todo The timer progress should return a motion value directly, and could
 * support an optional timer, which would cause it to return a motion value
 * of 0.
 */
function Notification({ children, timer, onDismiss }: NotificationProps) {
  const { progress } = useTimerProgress(timer);

  const remaining = useTransform(progress, (progress) => 1 - progress);

  return (
    <Placeholder
      data-testid="notification"
      onMouseEnter={timer?.pause}
      onMouseLeave={timer?.resume}
      pointerEvents="auto"
    >
      <Row
        justify="between"
        align="center"
        gap={400}
        padding={{ all: 200, left: 400 }}
      >
        {children}
        {onDismiss &&
          (timer ? (
            <ProgressIconButton
              progress={remaining}
              icon={Icon.Close}
              variant="tertiary"
              onClick={onDismiss}
            />
          ) : (
            <IconButton
              icon={Icon.Close}
              variant="tertiary"
              onClick={onDismiss}
            />
          ))}
      </Row>
    </Placeholder>
  );
}

export const Groups: StoryObj = {
  render: () => (
    <NotificationsProvider
      autoDismiss={{ banners: false }}
      limit={{ banners: 1, snackbars: 3 }}
    >
      <Column gap={400} size={{ height: "stretch" }}>
        <Banners />
        <Center>
          <Column gap={900} align="center">
            <Row gap={400}>
              <AddBannerButton />
              <ClearBannersButton />
            </Row>
            <Row gap={400}>
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
    <Popover
      open={true}
      anchor={{
        strategy: "fixed",
        parent: Origin.bottomRight,
        child: Origin.bottomRight,
        offset: { x: "-1rem", y: "-1rem" },
      }}
      pointerEvents="none"
    >
      <Column gap={400} align="end">
        {snackbars.map(({ id, notification }) => (
          <Notification key={id} {...notification} />
        ))}
        {queue.length > 0 && (
          <Placeholder size={250}>+{queue.length}</Placeholder>
        )}
      </Column>
    </Popover>
  );
};

const Banners = () => {
  const { banners, queue } = useBanners();

  if (banners.length <= 0) {
    return null;
  }

  return (
    <Popover
      open={true}
      anchor={{
        strategy: "fixed",
        parent: Origin.top,
        child: Origin.top,
        offset: { y: "1rem" },
      }}
      pointerEvents="none"
    >
      <Column gap={200}>
        {queue.length > 0 && (
          <Placeholder size={250}>+{queue.length}</Placeholder>
        )}
        {banners.toReversed().map(({ id, notification }) => (
          <Notification key={id} {...notification} />
        ))}
      </Column>
    </Popover>
  );
};

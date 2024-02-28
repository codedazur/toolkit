import { Timer } from "@codedazur/essentials";
import { ReactNode, createContext } from "react";

export interface NotificationProps {
  readonly onDismiss: () => void;
  readonly timer?: Timer;
  readonly children: ReactNode;
}

export type NotificationGroup = Array<{
  id: number;
  notification: NotificationProps;
}>;

export type Notifications = Record<string, NotificationGroup>;

export type AutoDismiss = number | false;

export interface NotificationsContext {
  readonly entries: Notifications;
  readonly queue: Notifications;
  readonly add: (
    group: string,
    children: ReactNode,
    options?: {
      autoDismiss?: AutoDismiss;
    },
  ) => NotificationProps;
  readonly remove: (group: string, id: number) => void;
  readonly clear: (group: string) => void;
}

const error = () => {
  throw new Error("No NotificationsProvider found in ancestry.");
};

export const notificationsContext = createContext<NotificationsContext>({
  entries: {},
  queue: {},
  add: error,
  remove: error,
  clear: error,
});

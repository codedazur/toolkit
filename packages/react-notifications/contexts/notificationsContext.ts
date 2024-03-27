import { Timer } from "@codedazur/essentials";
import { ReactNode, createContext } from "react";

export interface NotificationProps {
  onDismiss?: () => void;
  timer?: Timer;
  children?: ReactNode;
}

export type NotificationGroup = Array<{
  id: number;
  notification: NotificationProps;
}>;

export type Notifications = Record<string, NotificationGroup>;

export type AutoDismiss = number | false;

export interface NotificationsContext {
  entries: Notifications;
  queue: Notifications;
  add: (
    group: string,
    children: ReactNode,
    options?: {
      autoDismiss?: AutoDismiss;
    },
  ) => NotificationProps;
  remove: (group: string, id: number) => void;
  clear: (group: string) => void;
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

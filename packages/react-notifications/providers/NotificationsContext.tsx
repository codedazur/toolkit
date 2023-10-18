import { Timer } from "@codedazur/essentials";
import { ReactNode, createContext } from "react";

export interface NotificationProps {
  readonly id: number;
  readonly children: ReactNode;
  readonly dismiss: () => void;
  readonly timer?: Timer;
  readonly useProgress: (options?: { targetFps?: number }) => {
    progress: number;
    elapsed: number;
    remaining: number;
  };
}

export type NotificationGroup = Array<NotificationProps>;
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

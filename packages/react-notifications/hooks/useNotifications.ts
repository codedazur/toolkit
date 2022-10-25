import { ReactNode, useContext } from "react";
import { notificationsContext } from "../providers/NotificationsProvider";

export const useNotifications = (group: string = "default") => {
  const context = useContext(notificationsContext);

  return {
    notifications: Object.values(context.notifications[group] ?? {}),
    addNotification: (element: ReactNode) =>
      context.addNotification(group, element),
    removeNotification: (id: number) => context.removeNotification(group, id),
  };
};

import { ReactNode, useContext } from "react";
import { notificationsContext } from "../providers/NotificationsProvider";

export const useNotifications = (group: string = "default") => {
  const context = useContext(notificationsContext);

  return {
    notifications: Object.values(context.notifications[group] ?? {}),
    addNotification: (
      children: ReactNode,
      options?: { autoDismiss?: number | false }
    ) => context.addNotification(group, children, options),
    removeNotification: (id: number) => context.removeNotification(group, id),
  };
};

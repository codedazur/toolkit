import { ReactNode, useContext } from "react";
import { notificationsContext } from "../providers/NotificationsProvider";

export const useNotifications = (group: string = "default") => {
  const context = useContext(notificationsContext);

  return {
    entries: context.entries[group] ?? [],
    queue: context.queue[group] ?? [],
    add: (children: ReactNode, options?: { autoDismiss?: number | false }) =>
      context.add(group, children, options),
    remove: (id: number) => context.remove(group, id),
  };
};

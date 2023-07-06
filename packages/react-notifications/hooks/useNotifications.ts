import { ReactNode, useContext } from "react";
import { notificationsContext } from "../providers/NotificationsContext";

/**
 *
 * @param {string} [group="default"] - The notification group to associate with.
 * @returns {Object} - An object containing various functions and data related to notifications.
 * @property {Array} entries - An array of notification entries for the specified group.
 * @property {Array} queue - A queue of notifications for the specified group.
 * @property {Function} add - Adds a new notification to the specified group.
 * @property {Function} remove - Removes a notification with the specified ID from the group.
 * @property {Function} clear - Clears all notifications in the specified group.
 *
 * **/
export const useNotifications = (group: string = "default") => {
  const context = useContext(notificationsContext);

  return {
    entries: context.entries[group] ?? [],
    queue: context.queue[group] ?? [],
    add: (children: ReactNode, options?: { autoDismiss?: number | false }) =>
      context.add(group, children, options),
    remove: (id: number) => context.remove(group, id),
    clear: () => context.clear(group),
  };
};

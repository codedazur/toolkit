import { Timer } from "@codedazur/essentials";
import { useTimerProgress as timerProgressHook } from "@codedazur/react-essentials";
import {
  createContext,
  FunctionComponent,
  ReactNode,
  Reducer,
  useCallback,
  useReducer,
} from "react";

export interface NotificationsContext {
  readonly notifications: Notifications;
  readonly addNotification: (
    group: string,
    children: ReactNode,
    options?: {
      autoDismiss?: number | false;
    }
  ) => NotificationProps;
  readonly removeNotification: (group: string, id: number) => void;
}

type Notifications = Record<string, NotificationGroup>;

type NotificationGroup = Record<number, NotificationProps>;

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

const error = () => {
  throw new Error("No NotificationsProvider found in ancestry.");
};

export const notificationsContext = createContext<NotificationsContext>({
  notifications: {},
  addNotification: error,
  removeNotification: error,
});

interface AddAction {
  operation: "add";
  group: string;
  notification: NotificationProps;
}

interface RemoveAction {
  operation: "remove";
  group: string;
  id: number;
}

type Actions = AddAction | RemoveAction;

interface NotificationsProviderProps {
  autoDismiss?: number | false;
  children?: ReactNode;
}

/**
 * @todo Using multiple groups works, but configuring the provider _per_ group
 * is currently not possible. We could simply make all of the options a
 * `T | Record<string, T>`.
 * ```
 * <NotificationsProvider autoDismiss={{ banners: false, snackbars: 5000 }}>
 * ```
 * Alternatively, maybe we can somehow use multiple providers without them
 * overriding each other's contexts?
 * ```
 * <NotificationsProvider id="banners" autoDismiss={false}>
 *   <NotificationsProvider id="snackbars" autoDismiss={5000}>
 * ```
 * This _should_ be possible, since a provider can consume and augment the
 * context and re-provide that updated context. To improve the DX, we could also
 * include a `NotificationsProviders` which can be configured with multiple
 * groups.
 * ```
 * <NotificationsProviders groups={{
 *   banners: { autoDismiss: false },
 *   snackbars: { autoDismiss: 5000 },
 * }}>
 * ```
 * Although this last addition doesn't really seem to add much over the first
 * suggestion. 🤔
 *
 * Another suggestion: maybe we shouldn't allow configuration on the provider
 * level at all. We could say that devs can make their own hook for providing
 * default values:
 * ```
 * const useSnackbars = () => {
 *   const { notifications, add: addNotification, enqueue, remove } =
 *     useNotifications("snackbars");
 *
 *   const add = useCallback(
 *     (element, { autoDismiss = 5000 }) => {
 *       notifications.length > 3
 *         ? enqueue(element, { autoDismiss })
 *         : addNotification(element, { autoDismiss })
 *     },
 *     [addNotification, enqueue, notifications]
 *   );
 *
 *   return {
 *     snackbars: notifications,
 *     add,
 *     remove,
 *   }
 * }
 * ```
 *
 * @todo Add an optional `limit` to the number of simultaneous notifications,
 * offloading superfluous notifications to a queue.
 */
export const NotificationsProvider: FunctionComponent<
  NotificationsProviderProps
> = ({ autoDismiss: autoDismissAll = 5000, children }) => {
  const [notifications, dispatch] = useReducer<Reducer<Notifications, Actions>>(
    (state, action) => {
      switch (action.operation) {
        case "add":
          action.notification.timer?.start();

          return {
            ...state,
            [action.group]: {
              ...state[action.group],
              [action.notification.id]: action.notification,
            },
          };
        case "remove":
          delete state[action.group][action.id];
          return { ...state };
      }
    },
    {}
  );

  const removeNotification = useCallback((group: string, id: number) => {
    dispatch({
      operation: "remove",
      group,
      id,
    });
  }, []);

  const addNotification = useCallback(
    (
      group: string,
      children: ReactNode,
      { autoDismiss = autoDismissAll }: { autoDismiss?: number | false } = {}
    ) => {
      const id = Date.now();

      const dismiss = () => removeNotification(group, id);

      const timer = autoDismiss ? new Timer(dismiss, autoDismiss) : undefined;

      const useProgress = timer
        ? function useProgress(options: { targetFps?: number } = {}) {
            return timerProgressHook(timer, {
              ...options,
              immediately: !!autoDismiss,
            });
          }
        : function useProgress() {
            return { progress: 0, elapsed: 0, remaining: 0 };
          };

      const notification = {
        id,
        timer,
        children,
        dismiss,
        useProgress,
      };

      dispatch({
        operation: "add",
        group,
        notification,
      });

      return notification;
    },
    [autoDismissAll, removeNotification]
  );

  return (
    <notificationsContext.Provider
      value={{
        notifications,
        addNotification,
        removeNotification,
      }}
    >
      {children}
    </notificationsContext.Provider>
  );
};

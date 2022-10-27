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
      autoDismiss?: AutoDismiss;
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
  autoDismiss?: MaybeGrouped<AutoDismiss>;
  limit?: MaybeGrouped<Limit>;
  children?: ReactNode;
}

type MaybeGrouped<T> = T | Record<string, T>;

type Option = AutoDismiss | Limit;
type AutoDismiss = number | false;
type Limit = number | false;

/**
 * @todo Using multiple groups works, but configuring the provider _per_ group
 * is currently not possible. We could simply make all of the options a
 * `T | Record<string, T>`.
 * ```
 * <NotificationsProvider
 *   autoDismiss={{ banners: false }}
 *   limit={{ snackbars: 3, banners: 1 }}
 * >
 * ```
 *
 * @todo Create a Storybook example of abstracting the hook for a specific
 * group.
 * ```
 * const useSnackbars = () => {
 *   const { notifications, add, remove } = useNotifications("snackbars");
 *
 *   // Optional custom logic, e.g. overwriting the `add` method.
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
> = ({ autoDismiss, limit, children }) => {
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

  const getGroupOption = useCallback(
    (
      group: string,
      option: MaybeGrouped<Option> | undefined
    ): Option | undefined => {
      return isGrouped(option) ? option?.[group] ?? option?.default : option;
    },
    []
  );

  const getGroupAutoDismiss = useCallback(
    (group: string): AutoDismiss => {
      return getGroupOption(group, autoDismiss) ?? 5000;
    },
    [autoDismiss, getGroupOption]
  );

  const getGroupLimit = useCallback(
    (group: string): Limit => {
      return getGroupOption(group, limit) ?? false;
    },
    [limit, getGroupOption]
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
      {
        autoDismiss = getGroupAutoDismiss(group),
      }: { autoDismiss?: AutoDismiss } = {}
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
    [getGroupAutoDismiss, removeNotification]
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

function isGrouped(
  option: MaybeGrouped<Option> | undefined
): option is Record<string, Option> {
  return typeof option === "object";
}

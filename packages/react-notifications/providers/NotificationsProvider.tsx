import { revalueObject, Timer } from "@codedazur/essentials";
import { useTimerProgress as timerProgressHook } from "@codedazur/react-essentials";
import {
  createContext,
  FunctionComponent,
  ReactNode,
  Reducer,
  useCallback,
  useEffect,
  useReducer,
  useState,
} from "react";

export interface NotificationsContext {
  readonly entries: Notifications;
  readonly queue: Notifications;
  readonly add: (
    group: string,
    children: ReactNode,
    options?: {
      autoDismiss?: AutoDismiss;
    }
  ) => NotificationProps;
  readonly remove: (group: string, id: number) => void;
}

type Notifications = Record<string, NotificationGroup>;

type NotificationGroup = Array<NotificationProps>;

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
  entries: {},
  queue: {},
  add: error,
  remove: error,
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
 * @todo Explore an alternative for working with groups. How about a provider
 * that takes an array of hook returns? Is that crazy?
 * ```
 * <NotificationGroupsProvider groups={{
 *   snackbars: useNotifications({ limit: 3 }),
 *   banners: useNotifications({ autoDismiss: false })
 * }}>
 *
 * const groups = useNotificationGroups();
 * const snackbars = useNotificationGroup("snackbars");
 *
 * const localNotifications = useNotifications();
 * ```
 */
export const NotificationsProvider: FunctionComponent<
  NotificationsProviderProps
> = ({ autoDismiss, limit, children }) => {
  const [groups, dispatch] = useReducer<Reducer<Notifications, Actions>>(
    (state, action) => {
      switch (action.operation) {
        case "add":
          return {
            ...state,
            [action.group]: [
              ...(state[action.group] ?? []),
              action.notification,
            ],
          };
        case "remove":
          return {
            ...state,
            [action.group]: [
              ...(state[action.group] ?? []).filter(
                ({ id }) => id !== action.id
              ),
            ],
          };
      }
    },
    {}
  );

  const [entries, setEntries] = useState<Notifications>({});
  const [queue, setQueue] = useState<Notifications>({});

  useEffect(() => {
    setEntries(
      revalueObject(groups, ([group, all]) => {
        const groupLimit = getGroupLimit(group);
        const entries = groupLimit !== false ? all.slice(0, groupLimit) : all;

        entries.forEach((entry) => entry.timer?.resume());

        return entries;
      })
    );

    setQueue(
      revalueObject(groups, ([group, all]) => {
        const groupLimit = getGroupLimit(group);
        return groupLimit !== false ? all.slice(groupLimit) : [];
      })
    );
  }, [groups, limit]);

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

  const remove = useCallback((group: string, id: number) => {
    dispatch({
      operation: "remove",
      group,
      id,
    });
  }, []);

  const add = useCallback(
    (
      group: string,
      children: ReactNode,
      {
        autoDismiss = getGroupAutoDismiss(group),
      }: { autoDismiss?: AutoDismiss } = {}
    ) => {
      const id = Date.now();

      const dismiss = () => remove(group, id);

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
    [getGroupAutoDismiss, remove]
  );

  return (
    <notificationsContext.Provider
      value={{
        entries,
        queue,
        add,
        remove,
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

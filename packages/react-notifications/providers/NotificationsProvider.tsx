import { revalueObject, Timer } from "@codedazur/essentials";
import { useTimerProgress } from "@codedazur/react-essentials";
import {
  FunctionComponent,
  ReactNode,
  Reducer,
  useCallback,
  useEffect,
  useReducer,
  useState,
} from "react";
import {
  AutoDismiss,
  NotificationProps,
  Notifications,
  notificationsContext,
} from "./NotificationsContext";

interface AddAction {
  operation: "add";
  group: string;
  id: number;
  notification: NotificationProps;
}

interface RemoveAction {
  operation: "remove";
  group: string;
  id: number;
}
interface ClearAction {
  operation: "clear";
  group: string;
}

type Actions = AddAction | RemoveAction | ClearAction;

interface NotificationsProviderProps {
  autoDismiss?: MaybeGrouped<AutoDismiss>;
  limit?: MaybeGrouped<Limit>;
  children?: ReactNode;
}

type MaybeGrouped<T> = T | Record<string, T>;

type Option = AutoDismiss | Limit;

type Limit = number | false;

/**
 * @param autoDismiss: dismisses the notification after the given number of milliseconds defaults to 5000
 * @param limit: limits the number of notifications in the group defaults to false (no limit)
 * @example ```
 * <NotificationsProvider autoDismiss={5000}>
 *
 * const { entries } = useNotifications();
 * entries.map(props) => <Notification {...props} />
 * ```
 * @example ```
 * <NotificationsProvider
 *   autoDismiss={{ snackbars: 5000, banners: false }}
 *   limit={{ snackbars: false, banners: 1 }}
 * >
 *
 * const { entries } = useNotifications("snackbars");
 * entries.map(props) => <Snackbar {...props} />
 *
 * const { entries } = useNotifications("banners");
 * entries.map(props) => <Banner {...props} />
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
              { id: action.id, notification: action.notification },
            ],
          };
        case "remove":
          return {
            ...state,
            [action.group]: [
              ...(state[action.group] ?? []).filter(
                ({ id }) => id !== action.id,
              ),
            ],
          };
        case "clear":
          return {
            ...state,
            [action.group]: [],
          };
      }
    },
    {},
  );

  const [entries, setEntries] = useState<Notifications>({});
  const [queue, setQueue] = useState<Notifications>({});

  const getGroupOption = useCallback(
    (
      group: string,
      option: MaybeGrouped<Option> | undefined,
    ): Option | undefined => {
      return isGrouped(option) ? option?.[group] ?? option?.default : option;
    },
    [],
  );

  const getGroupAutoDismiss = useCallback(
    (group: string): AutoDismiss => {
      return getGroupOption(group, autoDismiss) ?? 5000;
    },
    [autoDismiss, getGroupOption],
  );

  const getGroupLimit = useCallback(
    (group: string): Limit => {
      return getGroupOption(group, limit) ?? false;
    },
    [limit, getGroupOption],
  );

  useEffect(() => {
    setEntries(
      revalueObject(groups, ([group, all]) => {
        const groupLimit = getGroupLimit(group);
        const entries = groupLimit !== false ? all.slice(0, groupLimit) : all;

        entries.forEach((entry) => entry.notification.timer?.resume());

        return entries;
      }),
    );

    setQueue(
      revalueObject(groups, ([group, all]) => {
        const groupLimit = getGroupLimit(group);
        return groupLimit !== false ? all.slice(groupLimit) : [];
      }),
    );
  }, [getGroupLimit, groups, limit]);

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
      }: { autoDismiss?: AutoDismiss } = {},
    ) => {
      const id = Date.now();

      const handleDismiss = () => remove(group, id);

      const timer = autoDismiss
        ? new Timer(handleDismiss, autoDismiss)
        : undefined;

      const notification = {
        id,
        timer,
        children,
        onDismiss: handleDismiss,
      };

      dispatch({
        operation: "add",
        group,
        id,
        notification,
      });

      return notification;
    },
    [getGroupAutoDismiss, remove],
  );

  const clear = useCallback((group: string) => {
    dispatch({
      operation: "clear",
      group,
    });
  }, []);

  return (
    <notificationsContext.Provider
      value={{
        entries,
        queue,
        add,
        remove,
        clear,
      }}
    >
      {children}
    </notificationsContext.Provider>
  );
};

function isGrouped(
  option: MaybeGrouped<Option> | undefined,
): option is Record<string, Option> {
  return typeof option === "object";
}

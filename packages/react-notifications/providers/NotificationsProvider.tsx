import {
  createContext,
  FunctionComponent,
  ReactNode,
  Reducer,
  useCallback,
  useReducer,
} from "react";
import { Timer } from "../../essentials/utilities/timing/Timer";

export interface NotificationsContext {
  notifications: Notifications;
  addNotification: (group: string, element: ReactNode) => NotificationProps;
  removeNotification: (group: string, id: number) => void;
}

type Notifications = Record<string, NotificationGroup>;

type NotificationGroup = Record<number, NotificationProps>;

export interface NotificationProps {
  id: number;
  timer: Timer;
  element: ReactNode;
  dismiss: () => void;
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
  children?: ReactNode;
}

export const NotificationsProvider: FunctionComponent<
  NotificationsProviderProps
> = ({ children }) => {
  const [notifications, dispatch] = useReducer<Reducer<Notifications, Actions>>(
    (state, action) => {
      switch (action.operation) {
        case "add":
          action.notification.timer.start();

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
        default:
          throw new Error();
      }
    },
    {}
  );

  const removeNotification = useCallback(
    (group: string, id: number) => {
      dispatch({
        operation: "remove",
        group,
        id,
      });
    },
    [dispatch]
  );

  const addNotification = useCallback(
    (group: string, element: ReactNode) => {
      const id = Date.now();

      const dismiss = () => removeNotification(group, id);

      const notification = {
        id,
        timer: new Timer(dismiss, 5000),
        element,
        dismiss,
      };

      dispatch({
        operation: "add",
        group,
        notification,
      });

      return notification;
    },
    [dispatch, removeNotification]
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

// import React, {
//     cloneElement,
//     ComponentType,
//     createContext,
//     FunctionComponent,
//     ReactElement,
//     ReactNode,
//     useCallback,
//     useEffect,
//     useRef,
//     useState,
//   } from "react";
//   import { v4 as uuid } from "uuid";
//   import { SnackbarContainer } from "../components/SnackbarContainer";
//   import { Timer } from "../utils/timing/Timer";

//   type SnackbarElement = ReactElement<SnackbarComponentProps>;

//   export interface SnackbarComponentProps {
//     id?: string;
//     timer?: Timer;
//   }

//   export interface SnackbarEntry {
//     id: string;
//     snackbar: SnackbarElement;
//     timer?: Timer;
//   }

//   export interface AddSnackbarOptions {
//     id?: string;
//     autoDismiss?: number | false;
//   }

//   export type AddSnackbarFn = (
//     snackbar: SnackbarElement | ((parameters: { id: string }) => SnackbarElement),
//     options?: AddSnackbarOptions,
//   ) => string;

//   export type RemoveSnackbarFn = (id: string) => void;

//   export interface SnackbarContext {
//     addSnackbar: AddSnackbarFn;
//     removeSnackbar: RemoveSnackbarFn;
//   }

//   export const SnackbarContext = createContext<SnackbarContext>({
//     addSnackbar: () => {
//       throw new Error("addSnackbar was called without a <SnackbarProvider>.");
//     },
//     removeSnackbar: () => {
//       throw new Error("removeSnackbar was called without a <SnackbarProvider>.");
//     },
//   });

//   export interface SnackbarProviderProps {
//     autoDismiss?: number | false;
//     container?: ComponentType<{ children?: ReactNode }>;
//     children?: ReactNode;
//   }

//   export const SnackbarProvider: FunctionComponent<SnackbarProviderProps> = ({
//     autoDismiss = 5000,
//     container: Container = SnackbarContainer,
//     children,
//   }) => {
//     const [snackbars, setSnackbars] = useState<SnackbarEntry[]>([]);
//     const snackbarsRef = useRef(snackbars);

//     useEffect(() => {
//       snackbarsRef.current = snackbars;
//     }, [snackbars]);

//     const removeSnackbar: RemoveSnackbarFn = useCallback((id) => {
//       setSnackbars((snackbars) =>
//         snackbars.filter((entry) => {
//           if (entry.id === id && entry.timer) {
//             entry.timer.stop();
//           }

//           return entry.id !== id;
//         }),
//       );
//     }, []);

//     const addSnackbar: AddSnackbarFn = useCallback(
//       (snackbar, options) => {
//         const id = options?.id ?? uuid();
//         const entryAutoDismiss = options?.autoDismiss ?? autoDismiss;

//         const timer =
//           entryAutoDismiss !== false
//             ? new Timer(() => {
//                 removeSnackbar(id);
//               }, entryAutoDismiss)
//             : undefined;
//         timer?.start();

//         setSnackbars((snackbars) => [
//           ...snackbars,
//           {
//             id,
//             snackbar:
//               typeof snackbar === "function" ? snackbar({ id }) : snackbar,
//             timer,
//           },
//         ]);

//         return id;
//       },
//       [autoDismiss, removeSnackbar],
//     );

//     useEffect(
//       () => () => {
//         for (const { timer } of snackbarsRef.current) {
//           timer?.stop();
//         }
//       },
//       [],
//     );

//     return (
//       <SnackbarContext.Provider value={{ addSnackbar, removeSnackbar }}>
//         <Container>
//           {snackbars.map((entry) =>
//             cloneElement(entry.snackbar, {
//               key: entry.id,
//               id: entry.id,
//               timer: entry.timer,
//             }),
//           )}
//         </Container>
//         {children}
//       </SnackbarContext.Provider>
//     );
//   };

//   export const SnackbarConsumer = SnackbarContext.Consumer;

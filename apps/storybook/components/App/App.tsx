"use client";

import {
  ComponentProvider,
  App as FusionApp,
  AppProps as FusionAppProps,
} from "@codedazur/fusion-ui";
import { surface as surfaceStyle } from "@codedazur/fusion-ui/style";
import { NotificationsProvider } from "@codedazur/react-notifications";
import "./App.css";

export interface AppProps extends FusionAppProps {
  surface?: boolean;
}

export function App({
  theme,
  surface,
  className,
  children,
  ...props
}: AppProps) {
  return (
    <ComponentProvider>
      <NotificationsProvider>
        <FusionApp
          theme={theme}
          {...props}
          className={[surface && surfaceStyle, className]}
        >
          {children}
        </FusionApp>
      </NotificationsProvider>
    </ComponentProvider>
  );
}

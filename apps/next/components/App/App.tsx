"use client";

import {
  ComponentProvider,
  App as FusionApp,
  AppProps as FusionAppProps,
} from "@codedazur/fusion-ui";
import { surface as surfaceStyle } from "@codedazur/fusion-ui/style";
import { NotificationsProvider } from "@codedazur/react-notifications";
import { DictionaryProvider } from "@codedazur/react-dictionary";
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
      <DictionaryProvider
        locale="en-US"
        dictionaries={{
          "en-US": {
            close: "Close",
            continue: "Continue",
            first: "First",
            last: "Last",
            menu: "Menu",
            mute: "Mute",
            next: "Next",
            pause: "Pause",
            play: "Play",
            previous: "Previous",
            unmute: "Unmute",
          },
        }}
      >
        <NotificationsProvider>
          <FusionApp
            theme={theme}
            {...props}
            className={[surface && surfaceStyle, className]}
          >
            {children}
          </FusionApp>
        </NotificationsProvider>
      </DictionaryProvider>
    </ComponentProvider>
  );
}

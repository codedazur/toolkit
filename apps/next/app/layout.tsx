import { size, surface } from "@codedazur/fusion-ui/style";
import { Metadata } from "next";
import { ReactNode } from "react";
import { App } from "../components/App";
import { GoogleTagManagerScript } from "../components/GoogleTagManagerScript";
import { RouteChangeTracker } from "../components/RouteChangeTracker";
import { TrackingProvider } from "../components/TrackingProvider";

const containerId = process.env.NEXT_PUBLIC_GTM_CONTAINER_ID;

interface RootLayoutProps {
  children: ReactNode;
}

export const metadata: Metadata = {
  title: "Next Starter",
  description: "A Next.js boilerplate by Code d'Azur.",
};

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="en" className={size({ height: "stretch" })}>
      <TrackingProvider>
        <RouteChangeTracker />
        <App as="body" className={surface}>
          {containerId && <GoogleTagManagerScript id={containerId} />}
          {children}
        </App>
      </TrackingProvider>
    </html>
  );
}

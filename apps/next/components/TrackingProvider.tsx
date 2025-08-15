"use client";

import { TrackingProvider as BaseTrackingProvider } from "@codedazur/react-tracking";
import { ReactNode } from "react";

export function TrackingProvider(props: { children: ReactNode }) {
  return <BaseTrackingProvider tracker={console.dir} {...props} />;
}

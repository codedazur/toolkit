import { Tracker } from "../providers/TrackingProvider";

declare global {
  interface Window {
    dataLayer: Array<Record<string, unknown>>;
  }
}

export function createGtmTracker({
  prefix,
}: { prefix?: string } = {}): Tracker {
  return function gtmTracker({ type, ...event }) {
    window.dataLayer.push({
      event: [prefix, type].filter(Boolean).join("."),
      ...event,
    });
  };
}

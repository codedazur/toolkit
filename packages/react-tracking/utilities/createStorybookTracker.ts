import { Tracker } from "../providers/TrackingProvider";

declare global {
  interface Window {
    dataLayer: Array<Record<string, unknown>>;
  }
}

export async function createStorybookTracker({
  name = "Tracker",
}: { name?: string } = {}): Promise<Tracker> {
  const { action } = await import("@storybook/addon-actions");

  return function storybookTracker(event) {
    action(name)(event);
  };
}
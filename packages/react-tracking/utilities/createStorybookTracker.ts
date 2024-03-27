import { Tracker } from "../components/TrackingProvider";

export async function createStorybookTracker({
  name = "trackEvent",
}: { name?: string } = {}): Promise<Tracker> {
  const { action } = await import("@storybook/addon-actions");

  return function storybookTracker(event) {
    action(name)(event);
  };
}

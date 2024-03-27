import { Tracker } from "../components/TrackingProvider";

export async function createStorybookTracker({
  name = "Tracker",
}: { name?: string } = {}): Promise<Tracker> {
  const { action } = await import("@storybook/addon-actions");

  return async function storybookTracker(event) {
    action(name)(event);
  };
}

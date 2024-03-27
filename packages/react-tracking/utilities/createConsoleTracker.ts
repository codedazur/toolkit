import { Tracker } from "../components/TrackingProvider";

export function createConsoleTracker({
  method = "dir",
}: { method?: "log" | "info" | "dir" } = {}): Tracker {
  return function logTracker(event) {
    console[method](event);
  };
}

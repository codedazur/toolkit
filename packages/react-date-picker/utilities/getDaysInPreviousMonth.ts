import { getDay, startOfMonth } from "date-fns";

export function getDaysInPreviousMonth(
  month: Date,
  weekStartsOn: number,
): number {
  const firstDayOfMonth = getDay(startOfMonth(month));

  return firstDayOfMonth >= weekStartsOn
    ? firstDayOfMonth - weekStartsOn
    : 6 - weekStartsOn + firstDayOfMonth + 1;
}

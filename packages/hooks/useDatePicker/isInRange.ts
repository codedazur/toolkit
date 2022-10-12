import { isAfter, isBefore } from "date-fns";

export function isInRange(
  date: Date,
  start?: Date | null,
  end?: Date | null
): boolean {
  const isBeforeMinDate = start && isBefore(date, start);
  const isAfterMaxDate = end && isAfter(date, end);

  return !isBeforeMinDate && !isAfterMaxDate;
}

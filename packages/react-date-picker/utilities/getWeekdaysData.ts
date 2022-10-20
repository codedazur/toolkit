import { addDays, eachDayOfInterval, endOfWeek, startOfWeek } from "date-fns";
import { getFormattingFn } from "./getFormattingFn";

interface GetWeekdaysDataProps {
  weekStartsOn: Day;
  weekdayLabelFormat: string | ((date: Date) => string);
  locale?: Locale | null;
}

export interface WeekdayData {
  label: string;
}

export function getWeekdaysData({
  weekStartsOn,
  weekdayLabelFormat: weekdayLabelFormatInput,
  locale,
}: GetWeekdaysDataProps): WeekdayData[] {
  const now = new Date();

  const weekdayLabelFormat =
    typeof weekdayLabelFormatInput === "string"
      ? getFormattingFn(weekdayLabelFormatInput, locale)
      : weekdayLabelFormatInput;

  return eachDayOfInterval({
    start: addDays(startOfWeek(now), weekStartsOn),
    end: addDays(endOfWeek(now), weekStartsOn),
  }).map((date) => ({ label: weekdayLabelFormat(date) }));
}

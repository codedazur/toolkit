import {
  Day,
  Locale,
  addDays,
  addMonths,
  eachDayOfInterval,
  endOfMonth,
  getDay,
  isSameMonth,
  startOfMonth,
} from "date-fns";
import { MouseEventHandler } from "react";
import { getDaysInPreviousMonth } from "./getDaysInPreviousMonth";
import { getFormattingFn } from "./getFormattingFn";

interface GetDaysDataProps {
  date: Date;
  weekStartsOn: Day;
  showExternalDays?: boolean;
  isFirstDate: (date: Date) => boolean;
  isLastDate: (date: Date) => boolean;
  isSelectedDate: (date: Date) => boolean;
  isWithinRange: (date: Date) => boolean;
  isWithinFocusedRange: (date: Date) => boolean;
  isDateDisabled: (date: Date) => boolean;
  handleDateClick: (date: Date) => void;
  handleDateMouseEnter: (date: Date) => void;
  handleDateMouseLeave: () => void;
  dayLabelFormat: string | ((date: Date) => string);
  locale?: Locale | null;
}

export interface DayData {
  date: Date;
  label: string;
  day: Day;
  isDisabled: boolean;
  isSelected: boolean;
  isFirstDate: boolean;
  isLastDate: boolean;
  isInActiveMonth: boolean;
  isInSelectedRange: boolean;
  isInFocusedRange: boolean;
  onClick: MouseEventHandler;
  onMouseEnter: MouseEventHandler;
  onMouseLeave: MouseEventHandler;
}

export function getDaysData({
  date,
  isFirstDate,
  isLastDate,
  isSelectedDate,
  isWithinRange,
  isWithinFocusedRange,
  weekStartsOn,
  isDateDisabled,
  showExternalDays,
  handleDateClick,
  handleDateMouseEnter,
  handleDateMouseLeave,
  dayLabelFormat: dayLabelFormatInput,
  locale,
}: GetDaysDataProps): Array<DayData | null> {
  const startOfThisMonth = startOfMonth(date);
  const endOfThisMonth = endOfMonth(date);
  const startOfNextMonth = startOfMonth(addMonths(date, 1));

  const start = addDays(
    startOfThisMonth,
    -getDaysInPreviousMonth(startOfThisMonth, weekStartsOn),
  );

  const end = addDays(
    endOfThisMonth,
    7 - getDaysInPreviousMonth(startOfNextMonth, weekStartsOn),
  );

  const dayLabelFormat =
    typeof dayLabelFormatInput === "string"
      ? getFormattingFn(dayLabelFormatInput, locale)
      : dayLabelFormatInput;

  return eachDayOfInterval({ start, end }).map((day) =>
    isSameMonth(day, date) || showExternalDays
      ? {
          date: day,
          day: getDay(day) as Day,
          label: dayLabelFormat(day),
          isDisabled: isDateDisabled(day),
          isInActiveMonth: isSameMonth(day, date),
          isSelected: isSelectedDate(day),
          isFirstDate: isFirstDate(day),
          isLastDate: isLastDate(day),
          isInSelectedRange: isWithinRange(day),
          isInFocusedRange: isWithinFocusedRange(day),
          onClick: () => handleDateClick(day),
          onMouseEnter: () => handleDateMouseEnter(day),
          onMouseLeave: handleDateMouseLeave,
        }
      : null,
  );
}

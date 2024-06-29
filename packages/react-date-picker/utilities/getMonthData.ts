import { Day, Locale } from "date-fns";
import { DayData, getDaysData } from "./getDaysData";
import { getFormattingFn } from "./getFormattingFn";
import { WeekdayData, getWeekdaysData } from "./getWeekdaysData";

interface GetMonthDataProps {
  date: Date;
  locale?: Locale | null;
  isFirstDate: (date: Date) => boolean;
  isLastDate: (date: Date) => boolean;
  isSelectedDate: (date: Date) => boolean;
  isWithinRange: (date: Date) => boolean;
  isWithinFocusedRange: (date: Date) => boolean;
  weekStartsOn: Day;
  showExternalDays?: boolean;
  isDateDisabled: (date: Date) => boolean;
  dayLabelFormat: string | ((date: Date) => string);
  weekdayLabelFormat: string | ((date: Date) => string);
  monthLabelFormat: string | ((date: Date) => string);
  handleDateClick: (date: Date) => void;
  handleDateMouseEnter: (date: Date) => void;
  handleDateMouseLeave: () => void;
}

export interface MonthData {
  year: number;
  month: number;
  label: string;
  weekdays: Array<WeekdayData>;
  days: Array<DayData | null>;
}

export function getMonthData({
  date,
  weekStartsOn,
  isFirstDate,
  isLastDate,
  isSelectedDate,
  isWithinRange,
  isWithinFocusedRange,
  isDateDisabled,
  showExternalDays,
  locale,
  dayLabelFormat,
  weekdayLabelFormat,
  monthLabelFormat: monthLabelFormatInput,
  handleDateClick,
  handleDateMouseEnter,
  handleDateMouseLeave,
}: GetMonthDataProps): MonthData {
  const monthLabelFormat =
    typeof monthLabelFormatInput === "string"
      ? getFormattingFn(monthLabelFormatInput, locale)
      : monthLabelFormatInput;

  return {
    year: date.getFullYear(),
    month: date.getMonth(),
    label: monthLabelFormat(date),
    weekdays: getWeekdaysData({ weekStartsOn, weekdayLabelFormat, locale }),
    days: getDaysData({
      date,
      weekStartsOn,
      dayLabelFormat,
      locale,
      isDateDisabled,
      showExternalDays,
      isFirstDate,
      isLastDate,
      isSelectedDate,
      isWithinRange,
      isWithinFocusedRange,
      handleDateClick,
      handleDateMouseEnter,
      handleDateMouseLeave,
    }),
  };
}

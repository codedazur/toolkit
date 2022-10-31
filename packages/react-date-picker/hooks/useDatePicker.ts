import { clamp } from "@codedazur/essentials";
import {
  addDays,
  addMonths,
  differenceInCalendarDays,
  isAfter,
  isBefore,
  isSameDay,
  isSameMonth,
  max,
  min,
  setMonth as setMonthDateFns,
  setYear,
  startOfMonth,
} from "date-fns";
import { useCallback, useEffect, useMemo, useState } from "react";
import { getMonthData, MonthData } from "../utilities/getMonthData";
import { isInRange } from "../utilities/isInRange";

export interface UseDatePickerProps extends UseDatePickerFlags {
  count?: number;
  initialDates?: Array<Date | null>;
  initialCursor?: number;
  initialMonth?: Date;
  weekStartsOn?: Day;
  minDate?: Date;
  maxDate?: Date;
  minDuration?: number;
  maxDuration?: number;
  isDateDisabled?: (
    date: Date,
    cursor: number,
    dates: Array<Date | null>
  ) => boolean;
  locale?: Locale | null;
  dayLabelFormat?: string | ((date: Date) => string);
  weekdayLabelFormat?: string | ((date: Date) => string);
  monthLabelFormat?: string | ((date: Date) => string);
}

interface UseDatePickerFlags {
  /**
   * This flag causes `setDate` to ignore calls for dates that are currently
   * disabled.
   *
   * @default false
   */
  ignoreDisabledDates?: boolean;

  /**
   * This flag will include the days from the previous and next months in the
   * current month. When not enabled, the month's `days` property will be
   * padded with blank entries instead.
   *
   * @default false
   */
  showExternalDays?: boolean;

  /**
   * This flag automatically switches the active month to the month of the
   * clicked date when the clicked date changes the starting date.
   *
   * @default false
   */
  autoProgressMonth?: boolean;

  /**
   * When clicking a date, this side-effect automatically increments the cursor
   * position so that the next date can immediately be selected. If you want
   * to control the cursor position manually, you can use the `setCursor`
   * function to do so and optionally disable this flag as well.
   *
   * @default true
   */
  autoProgressCursor?: boolean;

  /**
   * This side-effect makes sure that the selected dates are always in
   * chronological order by moving previously selected dates along with a newly
   * selected date.
   *
   * @default true
   */
  enforceChronologicalOrder?: boolean;

  /**
   * When a date is selected, this side-effect determines what should happen to
   * any selected dates that come after it.
   *
   * @enum {clear} Removes any subsequent selected dates.
   * @enum {shift} Moves subsequent dates along with the selected date.
   * @enum {keep} Leaves any subsequent dates where they are. Keep in mind that
   * the `enforceChronologicalOrder` flag may still affect any subsequent dates.
   *
   * @default clear
   */
  subsequentDates?: "clear" | "shift" | "keep";
}

// export enum Month {
//   January,
//   February,
//   March,
//   April,
//   May,
//   June,
//   July,
//   August,
//   September,
//   October,
//   November,
//   December,
// }

// export enum Day {
//   Sunday,
//   Monday,
//   Tuesday,
//   Wednesday,
//   Thursday,
//   Friday,
//   Saturday,
// }

export interface UseDatePickerResult {
  dates: Array<Date | null>;
  setDate: (index: number, date: Date | null) => void;
  clear: () => void;
  cursor: number;
  setCursor: (index: number) => void;
  isSelectedDate: (date: Date) => boolean;
  isFirstDate: (date: Date) => boolean;
  isLastDate: (date: Date) => boolean;
  isDateDisabled: (date: Date) => boolean;
  month: MonthData;
  /**
   * Returns a {@link MonthData} to be used for rendering more than one month.
   *
   * @param offset The number of months to offset the current `month` by. For
   * example, to get the previous month, use `getMonth(-1)`.
   */
  getMonth: (offset: number) => MonthData;
  toDate: (date: Date) => void;
  toMonth: (month: number) => void;
  toYear: (year: number) => void;
  moveMonth: (offset: number) => void;
  moveYear: (offset: number) => void;
  toPreviousMonth: () => void;
  toNextMonth: () => void;
  toPreviousYear: () => void;
  toNextYear: () => void;
}

export const useDatePicker = ({
  count = 2,
  initialDates,
  initialCursor = 0,
  initialMonth,
  weekStartsOn = 1,
  minDate,
  maxDate,
  minDuration,
  maxDuration,
  isDateDisabled: isDateDisabledByUser = () => false,
  dayLabelFormat = "dd",
  weekdayLabelFormat = "eeeeee",
  monthLabelFormat = "MMMM yyyy",
  locale,
  ignoreDisabledDates = false,
  showExternalDays = false,
  autoProgressMonth = false,
  autoProgressCursor = true,
  enforceChronologicalOrder = true,
  subsequentDates = "clear",
}: UseDatePickerProps = {}): UseDatePickerResult => {
  const [dates, setDates] = useState<Array<Date | null>>(
    new Array(count).fill(null).map((_, index) => initialDates?.[index] ?? null)
  );
  const [cursor, setCursor] = useState<number>(initialCursor);
  const [month, setMonth] = useState(
    startOfMonth(initialMonth ?? initialDates?.[0] ?? new Date())
  );
  const [focusedDate, setFocusedDate] = useState<Date | null>(null);

  useEffect(() => {
    setCursor((cursor) => clamp(cursor, 0, count - 1));
    setDates((dates) =>
      new Array(count).fill(null).map((_, index) => dates?.[index] ?? null)
    );
  }, [count]);

  const isDateDisabled = useCallback(
    (date: Date) => {
      if (isDateDisabledByUser(date, cursor, dates)) {
        return true;
      }

      if (!isInRange(date, minDate, maxDate)) {
        return true;
      }

      if (dates[0] && cursor > 0) {
        if (minDuration && isBefore(date, addDays(dates[0], minDuration - 1))) {
          return true;
        }

        if (maxDuration && isAfter(date, addDays(dates[0], maxDuration - 1))) {
          return true;
        }
      }

      return false;
    },
    [
      isDateDisabledByUser,
      maxDuration,
      maxDate,
      minDate,
      minDuration,
      dates,
      cursor,
    ]
  );

  const isFirstDate = useCallback(
    (date: Date) => {
      const lastDate = dates[0];
      return !!lastDate && isSameDay(date, lastDate);
    },
    [dates]
  );

  const isLastDate = useCallback(
    (date: Date) => {
      const lastDate = dates[dates.length - 1];
      return !!lastDate && isSameDay(date, lastDate);
    },
    [dates]
  );

  const isSelectedDate = useCallback(
    (date: Date) =>
      dates
        .map((otherDate) => otherDate && isSameDay(date, otherDate))
        .includes(true),
    [dates]
  );

  const isInSelectedRange = useCallback(
    (date: Date) => {
      const filteredDates = dates.filter((date): date is Date => date !== null);

      const minSelectedDate =
        filteredDates.length > 0 ? min(filteredDates) : null;

      const maxSelectedDate =
        filteredDates.length > 0 ? max(filteredDates) : null;

      if (!minSelectedDate || !maxSelectedDate) {
        return false;
      }

      return isInRange(date, minSelectedDate, maxSelectedDate);
    },
    [dates]
  );

  const isInFocusedRange = useCallback(
    (date: Date) => {
      const filteredDates = dates.filter((date): date is Date => date !== null);

      const minSelectedDate =
        filteredDates.length > 0 ? min(filteredDates) : null;

      if (!minSelectedDate || !focusedDate) {
        return false;
      }

      return isInRange(date, minSelectedDate, focusedDate);
    },
    [dates, focusedDate]
  );

  const setDate = useCallback(
    (index: number, date: Date | null) => {
      // Flag: ignoreDisabledDates
      if (ignoreDisabledDates && date && isDateDisabled(date)) {
        return;
      }

      const oldDate = dates[index];
      dates[index] = date;

      // Flag: subsequentDates
      if (index < dates.length - 1) {
        switch (subsequentDates) {
          case "shift":
            if (date && oldDate) {
              const difference = differenceInCalendarDays(date, oldDate);
              for (let i = index + 1; i <= dates.length - 1; i++) {
                const subsequentDate = dates[i];
                if (subsequentDate) {
                  dates[i] = addDays(subsequentDate, difference);
                }
              }
            }
            break;
          case "clear":
            for (let i = index + 1; i <= dates.length - 1; i++) {
              dates[i] = null;
            }
            break;
        }
      }

      // Flag: enforceChronologicalOrder
      if (enforceChronologicalOrder && date) {
        for (let i = 0; i <= dates.length - 1; i++) {
          const otherDate = dates[i];
          if (otherDate) {
            dates[i] =
              i < index ? min([otherDate, date]) : max([otherDate, date]);
          }
        }
      }

      // Flag: autoProgressMonth
      if (
        autoProgressMonth &&
        cursor === 0 &&
        date &&
        !isSameMonth(month, date)
      ) {
        setMonth(startOfMonth(date));
      }

      // Flag: autoProgressCursor
      if (autoProgressCursor) {
        setCursor((cursor + 1) % dates.length);
      }

      setDates([...dates]);
    },
    [
      dates,
      enforceChronologicalOrder,
      cursor,
      autoProgressMonth,
      month,
      autoProgressCursor,
      subsequentDates,
      ignoreDisabledDates,
      isDateDisabled,
    ]
  );

  const toDate = useCallback((date: Date) => setMonth(startOfMonth(date)), []);
  const toMonth = useCallback(
    (index: number) =>
      setMonth((month) => startOfMonth(setMonthDateFns(month, index))),
    []
  );
  const toYear = useCallback(
    (index: number) => setMonth((month) => startOfMonth(setYear(month, index))),
    []
  );

  const moveMonth = useCallback(
    (offset: number) =>
      setMonth((month) => startOfMonth(addMonths(month, offset))),
    []
  );
  const moveYear = useCallback(
    (offset: number) => moveMonth(offset * 12),
    [moveMonth]
  );

  const toPreviousMonth = useCallback(() => moveMonth(-1), [moveMonth]);
  const toNextMonth = useCallback(() => moveMonth(1), [moveMonth]);
  const toPreviousYear = useCallback(() => moveYear(-1), [moveYear]);
  const toNextYear = useCallback(() => moveYear(1), [moveYear]);

  const clear = useCallback(
    () => setDates((dates) => new Array(dates.length).fill(null) as null[]),
    []
  );

  const handleDateClick = useCallback(
    (date: Date) => {
      setDate(cursor, date);
    },
    [setDate, cursor]
  );

  const handleDateMouseEnter = useCallback(
    (date: Date) => {
      if (dates[cursor] === null) {
        setFocusedDate(date);
      }
    },
    [dates, cursor]
  );

  const handleDateMouseLeave = useCallback(() => {
    setFocusedDate(null);
  }, []);

  const getMonthByOffset = useCallback(
    (offset: number) => {
      const date = addMonths(month, offset);

      return getMonthData({
        date,
        weekStartsOn,
        isDateDisabled,
        showExternalDays,
        isFirstDate,
        isLastDate,
        isSelectedDate,
        isWithinRange: isInSelectedRange,
        isWithinFocusedRange: isInFocusedRange,
        handleDateClick,
        handleDateMouseEnter,
        handleDateMouseLeave,
        dayLabelFormat,
        weekdayLabelFormat,
        monthLabelFormat,
        locale,
      });
    },
    [
      month,
      weekStartsOn,
      showExternalDays,
      isDateDisabled,
      isFirstDate,
      isLastDate,
      isSelectedDate,
      isInSelectedRange,
      isInFocusedRange,
      handleDateClick,
      handleDateMouseEnter,
      handleDateMouseLeave,
      dayLabelFormat,
      weekdayLabelFormat,
      monthLabelFormat,
      locale,
    ]
  );

  const monthData = useMemo(() => getMonthByOffset(0), [getMonthByOffset]);

  return {
    dates,
    setDate,
    cursor,
    setCursor,
    isFirstDate,
    isLastDate,
    isSelectedDate,
    isDateDisabled,
    clear,
    month: monthData,
    getMonth: getMonthByOffset,
    toDate,
    toMonth,
    toYear,
    moveMonth,
    moveYear,
    toPreviousMonth,
    toNextMonth,
    toPreviousYear,
    toNextYear,
  };
};

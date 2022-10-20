import { omit } from "@codedazur/essentials";
import {
  useDatePicker,
  UseDatePickerProps,
  UseDatePickerResult,
} from "./useDatePicker";

export interface UseSingleDatePickerProps
  extends Omit<
    UseDatePickerProps,
    | "count"
    | "initialDates"
    | "minDuration"
    | "maxDuration"
    | "isDateDisabled"
    | "autoProgressCursor"
    | "enforceChronologicalOrder"
    | "subsequentDates"
  > {
  initialDate?: Date;
  isDateDisabled?: (date: Date, selectedDate: Date | null) => boolean;
}

export interface UseSingleDatePickerResult
  extends Omit<
    UseDatePickerResult,
    "dates" | "setDate" | "cursor" | "setCursor" | "isFirstDate" | "isLastDate"
  > {
  date: Date | null;
  setDate: (date: Date | null) => void;
}

export const useSingleDatePicker = ({
  initialDate,
  isDateDisabled,
  ...props
}: UseSingleDatePickerProps): UseSingleDatePickerResult => {
  const { dates, setDate, ...results } = useDatePicker({
    count: 1,
    initialDates: initialDate ? [initialDate] : undefined,
    minDuration: 1,
    maxDuration: 1,
    isDateDisabled: isDateDisabled
      ? (date, cursor, dates) => isDateDisabled(date, dates[0])
      : undefined,
    ...props,
  });

  return {
    ...omit(results, ["cursor", "setCursor", "isFirstDate", "isLastDate"]),
    date: dates[0],
    setDate: (date: Date | null) => {
      setDate(0, date);
    },
  };
};

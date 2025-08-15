import { Grid } from "@codedazur/fusion-ui";
import { UseDatePickerResult } from "@codedazur/react-date-picker";
import { FunctionComponent } from "react";
import { Day } from "./Day";

interface MonthProps {
  days: UseDatePickerResult["month"]["days"];
  onDayClick?: (date: Date) => void;
}

export const Days: FunctionComponent<MonthProps> = ({ days, onDayClick }) => (
  <Grid style={{ gridTemplateColumns: "repeat(7, 1fr)", gap: 0 }}>
    {days.map((day, index) => (
      <Grid.Item key={index}>
        {day !== null && (
          <Day
            isInFocusedRange={day.isInFocusedRange}
            isInSelectedRange={day.isInSelectedRange}
            isSelected={day.isSelected}
            isFirstDate={day.isFirstDate}
            isLastDate={day.isLastDate}
            isInActiveMonth={day.isInActiveMonth}
            disabled={day.isDisabled}
            onClick={onDayClick ? () => onDayClick(day.date) : day.onClick}
            onMouseEnter={day.onMouseEnter}
            onMouseLeave={day.onMouseLeave}
          >
            {day.label}
          </Day>
        )}
      </Grid.Item>
    ))}
  </Grid>
);

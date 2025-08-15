import { SymbolButton, SymbolButtonProps } from "@codedazur/fusion-ui";
import { day } from "./Day.css";

interface DayProps extends SymbolButtonProps {
  isInActiveMonth: boolean;
  isInSelectedRange: boolean;
  isInFocusedRange: boolean;
  isSelected: boolean;
  isFirstDate: boolean;
  isLastDate: boolean;
}

export function Day({
  isInActiveMonth,
  isInSelectedRange,
  isInFocusedRange,
  isSelected,
  isFirstDate,
  isLastDate,
  className,
  ...props
}: DayProps) {
  return (
    <SymbolButton
      variant="tertiary"
      {...props}
      className={[
        day({
          isInActiveMonth,
          isInSelectedRange,
          isInFocusedRange,
          isSelected,
          isFirstDate,
          isLastDate,
        }),
        className,
      ]}
    />
  );
}

import { useCallback } from "react";
import { useSelect, UseSelectProps, UseSelectResult } from "./useSelect";
import { Identifiable } from "./useSuggestions";

export interface UseSingleSelectProps<T extends string | Identifiable>
  extends UseSelectProps<T> {
  initialSelected?: T;
}

interface SingleSelectResult<T> extends Omit<UseSelectResult<T>, "selected"> {
  selected: T | null;
}

export const useSingleSelect = <T extends string | Identifiable>(
  props: UseSingleSelectProps<T>,
): SingleSelectResult<T> => {
  const { selected, isSelected, select, clear, ...result } =
    useSelect<T>(props);

  return {
    ...result,
    selected: selected[0] ?? null,
    isSelected,
    select: useCallback(
      (item: T) => {
        clear();
        select(item);
      },
      [clear, select],
    ),
    toggle: useCallback(
      (item: T) => {
        if (!isSelected(item)) {
          clear();
          select(item);
        } else {
          clear();
        }
      },
      [clear, isSelected, select],
    ),
    clear,
  };
};

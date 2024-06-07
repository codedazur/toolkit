import { useCallback, useState } from "react";
import { Identifiable } from "./useSuggestions";

export interface UseSelectProps<T extends string | Identifiable> {
  options: T[];
  initialSelected?: T | T[];
}

export interface UseSelectResult<T> {
  selected: T[];
  isSelected: (item: T) => boolean;
  select: (item: T) => void;
  deselect: (item: T) => void;
  toggle: (item: T) => void;
  clear: () => void;
}

export const useSelect = <T extends string | Identifiable>({
  options,
  initialSelected,
}: UseSelectProps<T>): UseSelectResult<T> => {
  const [selected, setSelected] = useState<T[]>(() => {
    if (initialSelected) {
      return Array.isArray(initialSelected)
        ? initialSelected
        : [initialSelected];
    }
    return [];
  });

  const assertOption = useCallback(
    (item: T) => {
      if (!options.includes(item)) {
        throw new Error(`The option "${JSON.stringify(item)}" does not exist.`);
      }
    },
    [options],
  );

  const isSelected = useCallback(
    (item: T) => selected.includes(item),
    [selected],
  );

  const select = useCallback(
    (item: T) => {
      assertOption(item);

      if (!isSelected(item)) {
        setSelected((prev) => prev.concat(item));
      }
    },
    [assertOption, isSelected],
  );

  const deselect = useCallback(
    (item: T) => {
      if (isSelected(item)) {
        setSelected((prev) => prev.filter((prevItem) => prevItem !== item));
      }
    },
    [isSelected],
  );

  const toggle = useCallback(
    (item: T) => {
      assertOption(item);

      if (isSelected(item)) {
        deselect(item);
      } else {
        select(item);
      }
    },
    [assertOption, isSelected, deselect, select],
  );

  const clear = useCallback(() => {
    setSelected([]);
  }, []);

  return {
    selected,
    isSelected,
    select,
    deselect,
    toggle,
    clear,
  };
};

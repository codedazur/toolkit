import { useEffect, useMemo, useState } from "react";
import { debounce as debounceFn } from "@codedazur/essentials";
import { useSynchronizedRef } from "@codedazur/react-essentials";

export interface UseSuggestionsProps<T extends string | Identifiable> {
  options: T[];
  initialQuery?: string;
  filter?: (
    query: string,
    options: T[],
    defaultFilterFn: DefaultFilterFunction<T>,
  ) => T[] | Promise<T[]>;
  debounce?: false | number;
}

export interface Identifiable {
  id: string;
}

type DefaultFilterFunction<T extends string | Identifiable> = (
  query: string,
  options: T[],
  defaultValidator: (query: string) => T[],
) => T[] | Promise<T[]>;

export interface UseSuggestionsResult<T> {
  query: string;
  setQuery: (value: string) => void;
  suggestions: T[];
}

const defaultFilterFn = <T extends string | Identifiable>(
  query: string,
  options: T[],
) =>
  options.filter((option) => {
    const pattern = new RegExp(`^${query}`, "i");

    return typeof option === "string"
      ? option.match(pattern)
      : option.id.match(pattern);
  });

export const useSuggestions = <T extends string | Identifiable>({
  options,
  initialQuery = "",
  filter = defaultFilterFn,
  debounce = false,
}: UseSuggestionsProps<T>): UseSuggestionsResult<T> => {
  const [debouncedFilter, cancelDebouncedFilter] = useMemo(
    () => debounceFn(filter, debounce !== false ? debounce : 0),
    [debounce, filter],
  );
  const cancelDebouncedFilterRef = useSynchronizedRef(cancelDebouncedFilter);
  const filterFn = debounce !== false ? debouncedFilter : filter;
  const [query, setQuery] = useState(initialQuery);
  const [suggestions, setSuggestions] = useState<T[]>([]);

  useEffect(() => {
    void (async () =>
      setSuggestions(await filterFn(query, options, defaultFilterFn)))();
  }, [query, options, filterFn]);

  useEffect(
    () => () => {
      cancelDebouncedFilterRef.current?.();
    },
    [cancelDebouncedFilterRef],
  );

  return {
    query,
    setQuery,
    suggestions,
  };
};

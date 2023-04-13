import { clamp, sequence } from "@codedazur/essentials";
import { useCallback, useMemo, useState } from "react";
import { formatSegments } from "../utilities/formatSegments";

interface UsePaginationBaseProps {
  initialPage?: number;
  siblings: number;
  boundary: number;
  gapSize?: number;
}

export interface UsePaginationWithCountProps extends UsePaginationBaseProps {
  count: number;
}

export interface UsePaginationWithItemsProps<T> extends UsePaginationBaseProps {
  items: Array<T>;
  itemsPerPage: number;
}

export type UsePaginationProps<T> =
  | UsePaginationWithCountProps
  | UsePaginationWithItemsProps<T>;

function isWithCount<T>(
  props: UsePaginationProps<T>
): props is UsePaginationWithCountProps {
  return "count" in props;
}

interface UsePaginationWithItemsResponse<T> {
  page: number;
  count: number;
  setPage: (page: number) => void;
  next: () => void;
  previous: () => void;
  range: number[][];
  items: T[];
}

type UsePaginationWithCountResponse = Omit<
  UsePaginationWithItemsResponse<never>,
  "items"
>;

type usePaginationResponse<T> =
  | UsePaginationWithItemsResponse<T>
  | UsePaginationWithCountResponse;

export function usePagination(
  props: UsePaginationWithCountProps
): UsePaginationWithCountResponse;

export function usePagination<T>(
  props: UsePaginationWithItemsProps<T>
): UsePaginationWithItemsResponse<T>;

export function usePagination<T>(
  props: UsePaginationProps<T>
): usePaginationResponse<T> {
  const { items, itemsPerPage, hasItems } = isWithCount(props)
    ? { items: sequence(1, props.count), itemsPerPage: 1, hasItems: false }
    : { ...props, hasItems: true };

  const count = useMemo(
    () => Math.ceil(items.length / itemsPerPage),
    [itemsPerPage, items]
  );

  const clampIndex = useCallback(
    (index: number) => clamp(index, 1, count),
    [count]
  );

  const [page, _setPage] = useState(clampIndex(props.initialPage ?? 1));

  const clampedSequence = useCallback(
    (start: number, end: number) =>
      sequence(clampIndex(start), clampIndex(end)),
    [clampIndex]
  );

  const { boundary = 1, siblings = 1, gapSize = 1 } = props;

  const range = useMemo(() => {
    const segments: [number[], number[], number[]] = [
      boundary ? clampedSequence(1, boundary) : [],
      clampedSequence(page - siblings, page + siblings),
      boundary ? clampedSequence(count + 1 - boundary, count) : [],
    ];

    return formatSegments(segments, count, siblings, boundary, gapSize);
  }, [page, boundary, siblings, clampedSequence, count, gapSize]);

  const currentItems = useMemo(
    () =>
      items.slice(
        (page - 1) * itemsPerPage,
        (page - 1) * itemsPerPage + itemsPerPage
      ),
    [itemsPerPage, items, page]
  );

  const setPage = (page: number) => _setPage(() => clampIndex(page));

  const next = () => setPage(page + 1);
  const previous = () => setPage(page - 1);

  return {
    page,
    setPage,
    next,
    previous,
    count,
    range,
    ...(hasItems ? { items: currentItems } : {}),
  };
}

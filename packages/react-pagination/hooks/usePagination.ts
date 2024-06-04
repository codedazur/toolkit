import { assert, clamp, sequence } from "@codedazur/essentials";
import { useCallback, useMemo, useState } from "react";
import { formatSegments } from "../utilities/formatSegments";

interface UsePaginationBaseProps {
  initialPage?: number;
  /**
   * The number of siblings pages to be shown on each side of the current page
   * in the pagination. For example, if siblings is 1, there will be one page on
   * the left and one page on the right of the current page.
   */
  siblings: number;

  /**
   * The number of boundaries pages to be shown at the beginning and end of the
   * pagination. These are the fixed pages shown at the extreme ends of the
   * pagination, typically used to provide direct access to the first and last
   * pages.
   */
  boundaries: number;

  gapSize?: number;
}

export interface UsePaginationWithPagesProps extends UsePaginationBaseProps {
  pages: number;
}

export interface UsePaginationWithItemsProps<T> extends UsePaginationBaseProps {
  items: Array<T>;
  itemsPerPage: number;
}

export type UsePaginationProps<T> =
  | UsePaginationWithPagesProps
  | UsePaginationWithItemsProps<T>;

function isWithCount<T>(
  props: UsePaginationProps<T>,
): props is UsePaginationWithPagesProps {
  return "pages" in props;
}

interface UsePaginationWithItemsResponse<T> {
  page: number;
  pages: number;
  setPage: (page: number) => void;
  next: () => void;
  previous: () => void;
  range: number[][];
  items: T[];
}

type UsePaginationWithPagesResponse = Omit<
  UsePaginationWithItemsResponse<never>,
  "items"
>;

type usePaginationResponse<T> =
  | UsePaginationWithItemsResponse<T>
  | UsePaginationWithPagesResponse;

export function usePagination(
  props: UsePaginationWithPagesProps,
): UsePaginationWithPagesResponse;

export function usePagination<T>(
  props: UsePaginationWithItemsProps<T>,
): UsePaginationWithItemsResponse<T>;

export function usePagination<T>(
  props: UsePaginationProps<T>,
): usePaginationResponse<T> {
  assert(props.boundaries >= 0, "Boundaries must be a positive number");
  assert(props.siblings >= 0, "Siblings must be a positive number");
  if (props.gapSize)
    assert(props.gapSize >= 0, "Gap size must be a positive number");
  if (props.initialPage) {
    assert(props.initialPage > 0, "Initial page must be a positive number");
  }

  const { items, itemsPerPage, hasItems } = isWithCount(props)
    ? { items: sequence(1, props.pages), itemsPerPage: 1, hasItems: false }
    : { ...props, hasItems: true };

  const computedPages = useMemo(
    () => Math.ceil(items.length / itemsPerPage),
    [itemsPerPage, items],
  );

  const clampIndex = useCallback(
    (index: number) => clamp(index, 1, Math.max(1, computedPages)),
    [computedPages],
  );

  const [page, _setPage] = useState(clampIndex(props.initialPage ?? 1));

  const clampedSequence = useCallback(
    (start: number, end: number) =>
      sequence(clampIndex(start), clampIndex(end)),
    [clampIndex],
  );

  const { boundaries = 1, siblings = 1, gapSize = 1 } = props;

  const range = useMemo(() => {
    const segments: [number[], number[], number[]] = [
      boundaries ? clampedSequence(1, boundaries) : [],
      clampedSequence(page - siblings, page + siblings),
      boundaries
        ? clampedSequence(computedPages + 1 - boundaries, computedPages)
        : [],
    ];

    return formatSegments(
      segments,
      computedPages,
      siblings,
      boundaries,
      gapSize,
    );
  }, [page, boundaries, siblings, clampedSequence, computedPages, gapSize]);

  const currentItems = useMemo(
    () =>
      items.slice(
        (page - 1) * itemsPerPage,
        (page - 1) * itemsPerPage + itemsPerPage,
      ),
    [itemsPerPage, items, page],
  );

  const setPage = (page: number) => _setPage(() => clampIndex(page));

  const next = () => setPage(page + 1);
  const previous = () => setPage(page - 1);

  return {
    page,
    setPage,
    next,
    previous,
    pages: computedPages,
    range,
    ...(hasItems ? { items: currentItems } : {}),
  };
}

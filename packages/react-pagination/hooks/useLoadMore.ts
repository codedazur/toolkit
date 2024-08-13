import { useCallback, useEffect, useMemo, useState } from "react";

export interface UseLoadMoreProps<T> {
  items: T[];
  itemsPerPage: number;
}

/**
 * @todo Review this code before releasing it.
 * @todo Support asynchoronously fetching more items _instead_ of providing all
 * items at once and using `itemsPerPage` to limit the results. These are two
 * very different use cases, so evaluate if this hook should support both, or if
 * we should create a new hook for the async case.
 * @todo Create an additional hook that calls this hook's `loadMore` function
 * when the bottom of some overflowing container is reached. The new hook should
 * be called `useInfiniteScroll` and should be a thin wrapper around this hook.
 * @todo Support setting the initial page.
 */
export function useLoadMore<T>({ items, itemsPerPage }: UseLoadMoreProps<T>) {
  const [page, setPage] = useState(1);

  const [visibleItems, setVisibleItems] = useState<T[]>(
    items.slice(0, itemsPerPage * page),
  );

  useEffect(() => {
    setVisibleItems(items.slice(0, itemsPerPage * page));
  }, [page, items, itemsPerPage]);

  const isOverflowing = useMemo(
    () => items.length > page * itemsPerPage,
    [page, items, itemsPerPage],
  );

  const loadMore = useCallback(() => {
    setPage((page) => page + 1);
  }, []);

  return {
    items: visibleItems,
    isOverflowing,
    loadMore,
  };
}

import { renderHook, act } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { usePagination } from "./usePagination";

describe("usePagination ", () => {
  describe("Fixed pages pagination", () => {
    it("should paginate with fixed pages", () => {
      const {
        result: {
          current: { page, pages, range, next, previous },
        },
      } = renderHook(() =>
        usePagination({
          pages: 20,
          initialPage: 1,
          siblings: 1,
          boundaries: 1,
          gapSize: 1,
        })
      );

      expect(page).toBe(1);
      expect(pages).toBe(20);
      expect(range).toEqual([[1, 2, 3, 4, 5], [20]]);
      expect(next).toBeDefined();
      expect(previous).toBeDefined();
    });

    it("should go to the next and previous page", () => {
      const { result } = renderHook(() =>
        usePagination({ pages: 20, initialPage: 1, siblings: 1, boundaries: 1 })
      );

      expect(result.current.range).toEqual([[1, 2, 3, 4, 5], [20]]);

      act(() => {
        result.current.setPage(2);
      });
      // Should not change the layout of the segments
      expect(result.current.range).toEqual([[1, 2, 3, 4, 5], [20]]);

      expect(result.current.page).toBe(2);

      act(() => {
        result.current.setPage(1);
      });

      expect(result.current.page).toBe(1);

      act(() => {
        result.current.previous(); // Try to go to the previous page (should remain on the first page)
      });
      expect(result.current.page).toBe(1);
    });
  });

  describe("Array-based pagination", () => {
    it("should paginate with an array of items", () => {
      const items = ["Item 1", "Item 2", "Item 3", "Item 4", "Item 5"];
      const itemsPerPage = 2;
      const { result } = renderHook(() =>
        usePagination({
          items,
          itemsPerPage,
          initialPage: 1,
          siblings: 1,
          boundaries: 1,
        })
      );

      expect(result.current.page).toBe(1);
      expect(result.current.pages).toBe(3);
      expect(result.current.range).toEqual([[1, 2, 3]]);
      expect(result.current.next).toBeDefined();
      expect(result.current.previous).toBeDefined();
      expect(result.current.items).toEqual(["Item 1", "Item 2"]);
    });

    it("should go to the next and previous page", () => {
      const items = ["Item 1", "Item 2", "Item 3", "Item 4", "Item 5"];
      const itemsPerPage = 2;
      const { result } = renderHook(() =>
        usePagination({
          items,
          itemsPerPage,
          initialPage: 1,
          siblings: 1,
          boundaries: 1,
        })
      );

      act(() => {
        result.current.next();
      });

      expect(result.current.page).toBe(2);
      expect(result.current.range).toEqual([[1, 2, 3]]);
      expect(result.current.items).toStrictEqual(["Item 3", "Item 4"]);
      act(() => {
        result.current.setPage(1);
      });
      expect(result.current.items).toStrictEqual(["Item 1", "Item 2"]);
      expect(result.current.page).toBe(1);
      act(() => {
        result.current.previous();
      });
      expect(result.current.page).toBe(1);
    });
  });

  describe("Negative values", () => {
    it("should throw an error when pages is negative or zero", () => {
      expect(() =>
        renderHook(() =>
          usePagination({
            pages: -1,
            initialPage: -1,
            siblings: -1,
            boundaries: -1,
            gapSize: -1,
          })
        )
      ).toThrow();
    });
    it("should throw an error when siblings is negative", () => {
      expect(() =>
        renderHook(() =>
          usePagination({
            pages: 1,
            initialPage: 1,
            siblings: -1,
            boundaries: 1,
            gapSize: 1,
          })
        )
      ).toThrow();
    });
    it("should throw an error when boundaries is negative", () => {
      expect(() =>
        renderHook(() =>
          usePagination({
            pages: 1,
            initialPage: 1,
            siblings: 1,
            boundaries: -1,
            gapSize: 1,
          })
        )
      ).toThrow();
    });
    it("should throw an error when gapSize is negative", () => {
      expect(() =>
        renderHook(() =>
          usePagination({
            pages: 1,
            initialPage: 1,
            siblings: 1,
            boundaries: 1,
            gapSize: -1,
          })
        )
      ).toThrow();
    });
    it("should throw an error when initialPage is negative", () => {
      expect(() =>
        renderHook(() =>
          usePagination({
            pages: 1,
            initialPage: -1,
            siblings: 1,
            boundaries: 1,
            gapSize: 1,
          })
        )
      ).toThrow();
    });
  });
});

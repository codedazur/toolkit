import { sequence } from "@codedazur/essentials";

const ACTIVE_PAGE_COUNT = 1;

type Range3 = [number[], number[], number[]];
type Range = number[][];

export function formatSegments(
  segments: Range3,
  count: number,
  siblings: number,
  boundary: number,
  gapSize: number = 1
): Range {
  const maxLength = boundary + gapSize + ACTIVE_PAGE_COUNT + siblings * 2;
  return mergeSegments(
    filterSegments(padSegments(segments, count, maxLength), count),
    gapSize
  );
}

export function padSegments(
  segments: Range3,
  count: number,
  maxLength: number
): Range3 {
  const lowerThreshold = maxLength;
  const upperThreshold = count + 1 - maxLength;

  let siblingSegment = segments[1];
  const firstSibling = siblingSegment[0];
  const lastSibling = siblingSegment[siblingSegment.length - 1];

  if (lastSibling < lowerThreshold) {
    siblingSegment = sequence(firstSibling, lowerThreshold);
  }

  if (firstSibling > upperThreshold) {
    siblingSegment = sequence(upperThreshold, lastSibling);
  }

  return [segments[0], siblingSegment, segments[2]];
}

export function mergeSegments(segments: Range, gapSize: number = 1): Range {
  return segments.reduce<Range>(
    (merged, current) => {
      const lastMerged = merged[merged.length - 1];
      const lastMergedFirst = lastMerged[0];
      const lastMergedLast = lastMerged[lastMerged.length - 1];
      const currentFirst = current[0];
      const currentLast = current[current.length - 1];

      if (currentFirst - lastMergedLast <= gapSize + 1) {
        merged.pop();
        merged.push(sequence(lastMergedFirst, currentLast));
      } else {
        merged.push(current);
      }

      return merged;
    },
    [segments.shift() as number[]]
  );
}

export function filterSegments(segments: Range3, count: number): Range {
  const siblingSegment = segments[1];
  const firstSibling = siblingSegment[0];
  const lastSibling = siblingSegment[siblingSegment.length - 1];

  return segments.filter((segment, index) => {
    if (segment.length === 0) {
      if (index === 0) {
        return firstSibling !== 1;
      } else if (index === segments.length - 1) {
        return lastSibling !== count;
      }
    }

    return true;
  });
}

import { assert } from "../assert";

export function chunk<T>(array: T[], size: number): T[][] {
  assert(size > 0, "Size must be greater than 0.");

  if (!array.length) {
    return [];
  }

  const head = array.slice(0, size);
  const tail = array.slice(size);

  return [head, ...chunk(tail, size)];
}

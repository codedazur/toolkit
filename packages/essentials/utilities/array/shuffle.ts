/**
 * The in-place Fisher-Yates shuffle algorithm.
 *
 * @param array The array that will be shuffled.
 * @returns The input array, now shuffled.
 * @see https://bost.ocks.org/mike/shuffle
 */
export function shuffle<T>(array: T[]) {
  let m = array.length;
  let t;
  let i;

  while (m) {
    i = Math.floor(Math.random() * m--);

    t = array[m];
    array[m] = array[i];
    array[i] = t;
  }

  return array;
}

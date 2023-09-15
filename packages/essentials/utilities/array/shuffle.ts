/**
 * The Fisher-Yates shuffle algorithm.
 *
 * @param array The array that will be shuffled.
 * @returns A shuffled clone of the input array.
 * @see https://bost.ocks.org/mike/shuffle
 */
export function shuffle<T>(array: T[]) {
  const arrayCopy = [...array];
  const arrayLength = arrayCopy.length;

  if (arrayLength === 0) {
    return arrayCopy;
  }

  const shuffledArray = [];

  while (arrayCopy.length > 0) {
    const randomIndex = Math.floor(Math.random() * arrayCopy.length);
    const removedItem = arrayCopy.splice(randomIndex, 1)[0];
    shuffledArray.push(removedItem);
  }

  return shuffledArray;
}

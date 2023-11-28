/**
 * Converts a string to PascalCase.
 */
export function pascalCase(string: string) {
  if (string === string.toUpperCase()) {
    string = string.toLowerCase();
  } else {
    string = string.replace(/([A-Z])/g, " $1");
  }

  return (string.match(/[a-zA-Z0-9]+/g) || [])
    .map(
      (word: string) =>
        `${word.charAt(0).toUpperCase()}${word.slice(1).toLowerCase()}`,
    )
    .join("");
}

export class AssertionError extends Error {
  constructor(message?: string) {
    super(message);
    this.name = "AssertionError";
  }
}

export function assert(
  condition: unknown,
  errorMessage?: string,
): asserts condition {
  if (condition === false) throw new AssertionError(errorMessage);
}

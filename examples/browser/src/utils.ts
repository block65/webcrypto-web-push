export function invariant<T>(
  condition: T | undefined | null | '' | 0 | false,
  message: string,
): asserts condition {
  if (!condition) {
    throw new Error(message);
  }
}

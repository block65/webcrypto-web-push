export function encodeRecordSize(size: number) {
  const bytes = new Uint8Array(4);
  new DataView(bytes.buffer).setUint32(0, size);
  return bytes;
}

export function invariant<T>(
  condition: T | undefined | null | '' | 0 | false,
  message: string,
): asserts condition {
  if (!condition) {
    throw new Error(message);
  }
}

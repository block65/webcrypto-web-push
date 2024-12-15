export function flattenUint8Array(arrays: Uint8Array[]) {
  const flatNumberArray = arrays.reduce((accum, arr) => {
    accum.push(...arr);
    return accum;
  }, [] as number[]);

  return new Uint8Array(flatNumberArray);
}

export function be16(val: number) {
  // present an 8bit value as a Big Endian 16bit value
  return ((val & 0xff) << 8) | ((val >> 8) & 0xff);
}

export function arrayChunk(arr: Uint8Array, chunkSize: number): Uint8Array[] {
  const chunks: Uint8Array[] = [];
  const arrayLength = arr.length;
  let i = 0;
  while (i < arrayLength) {
    const end = i + chunkSize;
    chunks.push(arr.slice(i, end));
    i = end;
  }
  return chunks;
}

export function generateNonce(base: Uint8Array, index: number) {
  /* generate a 96-bit IV for use in GCM, 48-bits of which are populated */
  const nonce = base.slice(0, 12);
  for (let i = 0; i < 6; ++i) {
    nonce[nonce.length - 1 - i] ^= (index / 256 ** i) & 0xff;
  }
  return nonce;
}

export function encodeLength(int: number) {
  return new Uint8Array([0, int]);
}

export function invariant<T>(
  condition: T | undefined | null | '' | 0 | false,
  message: string,
): asserts condition {
  if (!condition) {
    throw new Error(message);
  }
}

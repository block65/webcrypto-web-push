import {
  stringToUint8Array,
  toUint8Array,
  uint8ArrayToBase64,
} from 'uint8array-extras';

export function encodeBase64Url(value: Uint8Array | ArrayBuffer) {
  return uint8ArrayToBase64(toUint8Array(value), { urlSafe: true });
}

export function objectToBase64Url<T extends Record<string, unknown>>(
  obj: T,
): string {
  return encodeBase64Url(stringToUint8Array(JSON.stringify(obj)));
}

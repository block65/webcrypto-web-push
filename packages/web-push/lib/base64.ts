import {
  base64ToUint8Array,
  stringToUint8Array,
  toUint8Array,
  uint8ArrayToBase64,
  uint8ArrayToString,
} from 'uint8array-extras';

export function toBase64UrlSafe(value: Uint8Array | ArrayBuffer) {
  return uint8ArrayToBase64(toUint8Array(value), { urlSafe: true });
}

export function base64ToObject<T extends Record<string, unknown>>(
  str: string,
): T {
  return JSON.parse(uint8ArrayToString(base64ToUint8Array(str)));
}

export function objectToBase64UrlSafe<T extends Record<string, unknown>>(
  obj: T,
): string {
  return toBase64UrlSafe(stringToUint8Array(JSON.stringify(obj)));
}

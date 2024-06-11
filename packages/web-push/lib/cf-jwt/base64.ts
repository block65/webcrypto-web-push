import {
  decode as decodeBase64,
  encode as encodeBase64,
} from 'base64-arraybuffer';

export { decodeBase64, encodeBase64 };

export function decodeBase64Url(str: string): ArrayBuffer {
  return decodeBase64(str.replace(/-/g, '+').replace(/_/g, '/'));
}

export function encodeBase64Url(arr: ArrayBuffer): string {
  return encodeBase64(arr)
    .replace(/\//g, '_')
    .replace(/\+/g, '-')
    .replace(/=+$/, '');
}

export function base64UrlToObject<T extends Record<string, unknown>>(
  str: string,
): T {
  return JSON.parse(new TextDecoder().decode(decodeBase64Url(str))) as T;
}

export function objectToBase64Url<T extends Record<string, unknown>>(
  obj: T,
): string {
  return encodeBase64Url(new TextEncoder().encode(JSON.stringify(obj)));
}

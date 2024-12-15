import { stringToUint8Array } from 'uint8array-extras';
import { encodeLength } from './utils.js';

export function createInfo(
  clientPublic: Uint8Array,
  serverPublic: Uint8Array,
  type: 'aesgcm' | 'nonce' | 'auth',
) {
  return new Uint8Array([
    ...stringToUint8Array(`Content-Encoding: ${type}\0`),
    ...stringToUint8Array('P-256\0'),
    ...encodeLength(clientPublic.byteLength),
    ...clientPublic,
    ...encodeLength(serverPublic.byteLength),
    ...serverPublic,
  ]);
}

export function createInfo2(type: 'aesgcm' | 'nonce' | 'auth') {
  return stringToUint8Array(`Content-Encoding: ${type}\0`);
}

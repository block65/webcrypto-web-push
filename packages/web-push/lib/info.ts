import { stringToUint8Array } from 'uint8array-extras';

// RFC 8291 §3.4
export function createKeyInfo(
  clientPublic: Uint8Array,
  serverPublic: Uint8Array,
) {
  return new Uint8Array([
    ...stringToUint8Array('WebPush: info\0'),
    ...clientPublic,
    ...serverPublic,
  ]);
}

export function createInfo(type: 'aes128gcm' | 'nonce') {
  return stringToUint8Array(`Content-Encoding: ${type}\0`);
}

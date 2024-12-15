import { base64ToUint8Array } from 'uint8array-extras';
import { invariant } from './utils.js';

export function ecJwkToBytes(jwk: JsonWebKey) {
  invariant(jwk.x, 'jwk.x is missing');
  invariant(jwk.y, 'jwk.y is missing');

  const xBytes = base64ToUint8Array(jwk.x);
  const yBytes = base64ToUint8Array(jwk.y);

  // ANSI X9.62 point encoding - 0x04 for uncompressed
  return new Uint8Array([0x04, ...xBytes, ...yBytes]);
}

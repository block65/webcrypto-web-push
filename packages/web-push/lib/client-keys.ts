import { base64ToUint8Array, stringToUint8Array } from 'uint8array-extras';
import { toBase64UrlSafe } from './base64.js';
import { crypto } from './isomorphic-crypto.js';
import type { PushSubscription } from './types.js';

export async function deriveClientKeys(sub: PushSubscription) {
  const bytes = base64ToUint8Array(sub.keys.p256dh);

  const publicJwk = {
    kty: 'EC',
    crv: 'P-256',
    x: toBase64UrlSafe(bytes.slice(1, 33)),
    y: toBase64UrlSafe(bytes.slice(33, 65)),
    ext: true,
  } satisfies JsonWebKey;

  return {
    publicKeyBytes: new Uint8Array(bytes),
    publicKey: await crypto.subtle.importKey(
      'jwk',
      publicJwk,
      {
        name: 'ECDH',
        namedCurve: 'P-256',
      },
      true,
      [],
    ),
    authSecretBytes: stringToUint8Array(sub.keys.auth),
  };
}

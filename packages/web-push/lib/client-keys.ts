import { base64ToUint8Array } from 'uint8array-extras';
import type { PushSubscription } from './types.js';
import { invariant } from './utils.js';

export async function deriveClientKeys(sub: PushSubscription) {
  const bytes = base64ToUint8Array(sub.keys.p256dh);
  const authSecretBytes = base64ToUint8Array(sub.keys.auth);

  // ANSI X9.62 point encoding - 0x04 for uncompressed
  invariant(
    bytes.byteLength === 65 && bytes[0] === 0x04,
    'Subscription p256dh is not an uncompressed P-256 point',
  );

  // RFC 8291 §3.2
  invariant(
    authSecretBytes.byteLength === 16,
    'Subscription auth secret is not 16 bytes',
  );

  return {
    publicKeyBytes: bytes,
    publicKey: await crypto.subtle.importKey(
      'raw',
      bytes,
      {
        name: 'ECDH',
        namedCurve: 'P-256',
      },
      false,
      [],
    ),
    authSecretBytes,
  };
}

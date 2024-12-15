import { base64ToUint8Array } from 'uint8array-extras';
import { crypto } from './isomorphic-crypto.js';
import type { PushSubscription } from './types.js';
import { invariant } from './utils.js';
import { toBase64UrlSafe } from './base64.js';
import { sign } from './jwt.js';

// undefined as its likely they are coming from env vars
// and this just makes DX nicer to check
export type VapidKeys = {
  subject: string | undefined;
  publicKey: string | undefined;
  privateKey: string | undefined;
};

export async function vapidHeaders(
  subscription: PushSubscription,
  vapid: VapidKeys,
) {
  invariant(vapid.subject, 'Vapid subject is empty');
  invariant(vapid.privateKey, 'Vapid private key is empty');
  invariant(vapid.publicKey, 'Vapid public key is empty');

  const vapidPublicKeyBytes = base64ToUint8Array(vapid.publicKey);

  const publicKey = await crypto.subtle.importKey(
    'jwk',
    {
      kty: 'EC',
      crv: 'P-256',
      x: toBase64UrlSafe(vapidPublicKeyBytes.slice(1, 33)),
      y: toBase64UrlSafe(vapidPublicKeyBytes.slice(33, 65)),
      d: vapid.privateKey,
    },
    {
      name: 'ECDSA',
      namedCurve: 'P-256',
    },
    false,
    ['sign'],
  );

  const jwt = await sign(
    {
      aud: new URL(subscription.endpoint).origin,
      exp: Math.floor(Date.now() / 1000) + 12 * 60 * 60,
      sub: vapid.subject,
    },
    publicKey,
    {
      algorithm: 'ES256',
    },
  );

  return {
    headers: {
      authorization: `WebPush ${jwt}`,
      'crypto-key': `p256ecdsa=${vapid.publicKey}`,
    },
    // publicJwk,
  };
}

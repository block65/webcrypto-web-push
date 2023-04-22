import { decodeBase64Url, encodeBase64Url } from './base64.js';
import { sign } from './cf-jwt/main.js';
import type { PushSubscription } from './types.js';

export interface VapidKeys {
  subject: string;
  publicKey: string;
  privateKey: string;
}

export async function vapidHeaders(
  subscription: PushSubscription,
  vapid: VapidKeys,
) {
  const vapidPublicKeyBytes = decodeBase64Url(vapid.publicKey);

  const publicJwk = await crypto.subtle.importKey(
    'jwk',
    {
      kty: 'EC',
      crv: 'P-256',
      x: encodeBase64Url(vapidPublicKeyBytes.slice(1, 33)),
      y: encodeBase64Url(vapidPublicKeyBytes.slice(33, 65)),
      d: vapid.privateKey,
    },
    {
      name: 'ECDSA',
      namedCurve: 'P-256',
    },
    true,
    ['sign'],
  );

  const jwt = await sign(
    {
      aud: new URL(subscription.endpoint).origin,
      exp: Math.floor(Date.now() / 1000) + 12 * 60 * 60,
      sub: vapid.subject,
    },
    publicJwk,
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

import { base64ToUint8Array } from 'uint8array-extras';
import { encodeBase64Url } from './base64.js';
import { sign } from './jwt.js';
import type { PushSubscription } from './types.js';
import { invariant } from './utils.js';

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

  const endpoint = new URL(subscription.endpoint);

  // RFC 8030 §2 push resources are https
  invariant(
    endpoint.protocol === 'https:',
    `Subscription endpoint is not https: ${endpoint.protocol}`,
  );

  const vapidPublicKeyBytes = base64ToUint8Array(vapid.publicKey);

  const publicKey = await crypto.subtle.importKey(
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
    false,
    ['sign'],
  );

  const jwt = await sign(
    {
      aud: endpoint.origin,
      exp: Math.floor(Date.now() / 1000) + 12 * 60 * 60,
      sub: vapid.subject,
    },
    publicKey,
  );

  // RFC 8292 §3.1
  return {
    headers: {
      authorization: `vapid t=${jwt}, k=${vapid.publicKey}`,
    },
  };
}

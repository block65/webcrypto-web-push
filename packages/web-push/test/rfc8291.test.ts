import { base64ToUint8Array, stringToUint8Array } from 'uint8array-extras';
import { expect, test, vi } from 'vitest';
import { encodeBase64Url } from '../lib/base64.js';
import { encryptNotification } from '../lib/encrypt.js';
import type { PushSubscription } from '../lib/types.js';
import { rfc8291 } from './fixtures/rfc8291.js';

vi.mock(import('../lib/salt.js'), () => ({
  getSalt: async () => base64ToUint8Array(rfc8291.salt),
}));

vi.mock(import('../lib/local-keys.js'), () => ({
  generateLocalKeys: async () => {
    const publicKeyBytes = base64ToUint8Array(rfc8291.asPublic);

    const privateJwk = {
      kty: 'EC',
      crv: 'P-256',
      x: encodeBase64Url(publicKeyBytes.slice(1, 33)),
      y: encodeBase64Url(publicKeyBytes.slice(33, 65)),
      d: rfc8291.asPrivate,
    } satisfies JsonWebKey;

    return {
      publicKeyBytes,
      privateKey: await crypto.subtle.importKey(
        'jwk',
        privateJwk,
        { name: 'ECDH', namedCurve: 'P-256' },
        false,
        ['deriveBits'],
      ),
    };
  },
}));

test('RFC 8291 §5 example', async () => {
  const subscription: PushSubscription = {
    endpoint: 'https://push.example.com/push/receipt',
    expirationTime: null,
    keys: {
      p256dh: rfc8291.uaPublic,
      auth: rfc8291.authSecret,
    },
  };

  // the RFC example carries no padding
  const body = await encryptNotification(
    subscription,
    stringToUint8Array(rfc8291.plaintext),
    { pad: false },
  );

  expect(encodeBase64Url(body)).toBe(rfc8291.body);
  expect(body.subarray(0, 16)).toEqual(base64ToUint8Array(rfc8291.salt));
});

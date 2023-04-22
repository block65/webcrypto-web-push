import { afterEach, describe, expect, test, vi } from 'vitest';
import { decodeBase64Url, encodeBase64Url } from '../lib/base64.js';
import { encryptNotification } from '../lib/encrypt.js';
import { vapidHeaders } from '../lib/vapid.js';
import { fakeSubscriptions, fakeVapid } from './fixtures.js';

vi.mock('../lib/salt.js', () => ({
  getSalt: () => decodeBase64Url('4CQCKEyyOT_LysC17rsMXQ'),
}));

vi.mock('../lib/local-keys.js', () => ({
  generateLocalKeys: async () => {
    const publicJwk: JsonWebKey = {
      crv: 'P-256',
      ext: true,
      key_ops: ['deriveBits'],
      kty: 'EC',
      x: '7r5MIcg14B8yGrjhJAudH7c1mcB_B7af4KNwRJseU5w',
      y: 'Jkx_8JqbcwRJMd5zrZouJbIUe2AkFnhoDavSymNyOA0',
    };

    const privateJwk: JsonWebKey = {
      ...publicJwk,
      d: 'yFSH4q5h6mJ2VMryum5Nl31luqJQO8zzUJyIwgn0vVk',
    };

    return {
      publicJwk,
      privateKey: await crypto.subtle.importKey(
        'jwk',
        privateJwk,
        { name: 'ECDH', namedCurve: 'P-256' },
        true,
        ['deriveBits'],
      ),
      publicKey: await crypto.subtle.importKey(
        'jwk',
        publicJwk,
        { name: 'ECDH', namedCurve: 'P-256' },
        true,
        [],
      ),
    };
  },
}));

describe('', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  test('encryptNotification', async () => {
    const subscription = fakeSubscriptions.test;

    const encryptResult = await encryptNotification(
      subscription,
      new TextEncoder().encode('This is test data.'),
    );

    const { headers } = await vapidHeaders(subscription, fakeVapid);

    const requestInfo = {
      headers: {
        ...headers,

        'crypto-key': `keyid=p256dh;dh=${encodeBase64Url(
          encryptResult.serverPublic,
        )};${headers['crypto-key']}`,

        encryption: `keyid=p256dh;salt=${encodeBase64Url(encryptResult.salt)}`,

        'content-encoding': 'aesgcm',
        'content-length': encryptResult.ciphertext.byteLength.toString(),
        'content-type': 'application/octet-stream',
      },
      method: 'post',
      body: encryptResult.ciphertext,
    } satisfies RequestInit;

    expect(requestInfo).toBeTruthy();
  });
});

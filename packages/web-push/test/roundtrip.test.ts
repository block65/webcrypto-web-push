import {
  stringToUint8Array,
  uint8ArrayToBase64,
  uint8ArrayToString,
} from 'uint8array-extras';
import { expect, test } from 'vitest';
import { encryptNotification } from '../lib/encrypt.js';
import { hkdf } from '../lib/hkdf.js';
import { createInfo, createKeyInfo } from '../lib/info.js';
import { buildPushPayload } from '../lib/main.js';
import type { PushSubscription } from '../lib/types.js';
import { insecureVapid } from './fixtures/vapid.js';

// the user agent side of RFC 8291, as a browser would do it
async function decryptNotification(
  body: Uint8Array,
  privateKey: CryptoKey,
  publicKeyBytes: Uint8Array<ArrayBuffer>,
  authSecretBytes: Uint8Array<ArrayBuffer>,
) {
  const view = new DataView(body.buffer, body.byteOffset, body.byteLength);
  const salt = body.slice(0, 16);
  const keyIdLength = view.getUint8(20);
  const serverPublicKeyBytes = body.slice(21, 21 + keyIdLength);
  const ciphertext = body.slice(21 + keyIdLength);

  const serverPublicKey = await crypto.subtle.importKey(
    'raw',
    serverPublicKeyBytes,
    { name: 'ECDH', namedCurve: 'P-256' },
    true,
    [],
  );

  const sharedSecret = await crypto.subtle.deriveBits(
    { name: 'ECDH', public: serverPublicKey },
    privateKey,
    256,
  );

  const ikmHkdf = await hkdf(authSecretBytes, sharedSecret);
  const ikm = await ikmHkdf.extract(
    createKeyInfo(publicKeyBytes, serverPublicKeyBytes),
    32,
  );

  const messageHkdf = await hkdf(salt, ikm);
  const cekBytes = await messageHkdf.extract(createInfo('aes128gcm'), 16);
  const nonceBytes = await messageHkdf.extract(createInfo('nonce'), 12);

  const cekCryptoKey = await crypto.subtle.importKey(
    'raw',
    cekBytes,
    { name: 'AES-GCM', length: 128 },
    false,
    ['decrypt'],
  );

  const decrypted = new Uint8Array(
    await crypto.subtle.decrypt(
      { name: 'AES-GCM', iv: nonceBytes },
      cekCryptoKey,
      ciphertext,
    ),
  );

  // 0x02 delimits the last record, everything after it is zero padding
  return uint8ArrayToString(decrypted.subarray(0, decrypted.lastIndexOf(0x02)));
}

async function createSubscription() {
  const keyPair = await crypto.subtle.generateKey(
    { name: 'ECDH', namedCurve: 'P-256' },
    true,
    ['deriveBits'],
  );

  const publicKeyBytes = new Uint8Array(
    await crypto.subtle.exportKey('raw', keyPair.publicKey),
  );
  const authSecretBytes = crypto.getRandomValues(new Uint8Array(16));

  return {
    privateKey: keyPair.privateKey,
    publicKeyBytes,
    authSecretBytes,
    subscription: {
      endpoint: 'https://push.example.com/push/receipt',
      expirationTime: null,
      keys: {
        p256dh: uint8ArrayToBase64(publicKeyBytes, { urlSafe: true }),
        auth: uint8ArrayToBase64(authSecretBytes, { urlSafe: true }),
      },
    } satisfies PushSubscription,
  };
}

test.each([
  ['short', 'Some text'],
  ['empty', ''],
  ['unicode', 'ĥéllo 👋 wörld'],
  ['maximum size', 'x'.repeat(3993)],
])('a subscriber can decrypt a %s payload', async (_name, plaintext) => {
  const { subscription, privateKey, publicKeyBytes, authSecretBytes } =
    await createSubscription();

  const body = await encryptNotification(
    subscription,
    stringToUint8Array(plaintext),
  );

  await expect(
    decryptNotification(body, privateKey, publicKeyBytes, authSecretBytes),
  ).resolves.toBe(plaintext);
});

test('a payload over the record size is rejected', async () => {
  const { subscription } = await createSubscription();

  await expect(
    encryptNotification(subscription, stringToUint8Array('x'.repeat(3994))),
  ).rejects.toThrow('Payload is 3994 bytes, the maximum is 3993');
});

test.each([0, 1, 100, 3993])(
  'a padded payload of %i bytes is a constant 4096 octets',
  async (size) => {
    const { subscription } = await createSubscription();

    const body = await encryptNotification(
      subscription,
      stringToUint8Array('x'.repeat(size)),
    );

    expect(body.byteLength).toBe(4096);
  },
);

test('an endpoint that is not https is rejected', async () => {
  const { subscription } = await createSubscription();

  await expect(
    buildPushPayload(
      { data: 'nope' },
      { ...subscription, endpoint: 'http://push.example.com/push' },
      insecureVapid,
    ),
  ).rejects.toThrow('not https');
});

test('a p256dh that is not an uncompressed point is rejected', async () => {
  const { subscription } = await createSubscription();

  await expect(
    encryptNotification(
      {
        ...subscription,
        keys: {
          ...subscription.keys,
          p256dh: subscription.keys.p256dh.slice(4),
        },
      },
      stringToUint8Array('nope'),
    ),
  ).rejects.toThrow('not an uncompressed P-256 point');
});

test('an auth secret that is not 16 bytes is rejected', async () => {
  const { subscription } = await createSubscription();

  await expect(
    encryptNotification(
      { ...subscription, keys: { ...subscription.keys, auth: 'c2hvcnQ' } },
      stringToUint8Array('nope'),
    ),
  ).rejects.toThrow('auth secret is not 16 bytes');
});

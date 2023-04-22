import { deriveClientKeys } from './client-keys.js';
import { hkdf } from './hkdf.js';
import { createInfo, createInfo2 } from './info.js';
import { ecJwkToBytes } from './jwk-to-bytes.js';
import { generateLocalKeys } from './local-keys.js';
import { getSalt } from './salt.js';
import type { PushSubscription } from './types.js';
import { arrayChunk, be16, flattenUint8Array, generateNonce } from './utils.js';

export interface EncryptedNotification {
  ciphertext: Uint8Array;
  salt: Uint8Array;
  serverPublic: Uint8Array;
}

// See https://developer.chrome.com/blog/web-push-encryption/
export async function encryptNotification(
  clientSubscription: PushSubscription,
  plaintext: Uint8Array,
): Promise<EncryptedNotification> {
  const clientKeys = await deriveClientKeys(clientSubscription);
  const salt = await getSalt();

  // Server keys
  const serverKeys = await generateLocalKeys();
  const serverPublic = ecJwkToBytes(serverKeys.publicJwk);

  const sharedSecret = await crypto.subtle.deriveBits(
    {
      name: 'ECDH',
      // @ts-expect-error - cloudflare worker encryption types are wrong?
      // namedCurve: 'P-256',
      public: clientKeys.publicKey,
    },
    serverKeys.privateKey,
    256,
  );

  // Infos
  const cekInfo = createInfo(clientKeys.publicBytes, serverPublic, 'aesgcm');
  const nonceInfo = createInfo(clientKeys.publicBytes, serverPublic, 'nonce');
  const keyInfo = createInfo2('auth');

  // Encrypt
  const ikmHkdf = await hkdf(clientKeys.authSecretBytes, sharedSecret);
  const ikm = await ikmHkdf.extract(keyInfo, 32);

  const messageHkdf = await hkdf(salt, ikm);
  const cekBytes = await messageHkdf.extract(cekInfo, 16);
  const nonceBytes = await messageHkdf.extract(nonceInfo, 12);

  const cekCryptoKey = await crypto.subtle.importKey(
    'raw',
    cekBytes,
    {
      name: 'AES-GCM',
      length: 128,
    },
    false,
    ['encrypt'],
  );

  const cipherChunks = await Promise.all(
    arrayChunk(plaintext, 4095).map(async (chunk, idx) => {
      const padSize = 0;
      const x = new Uint16Array([be16(padSize)]);
      const padded = new Uint8Array([
        ...new Uint8Array(x.buffer, x.byteOffset, x.byteLength),
        ...chunk,
      ]);

      const encrypted = await crypto.subtle.encrypt(
        {
          name: 'AES-GCM',
          iv: generateNonce(new Uint8Array(nonceBytes), idx),
        },
        cekCryptoKey,
        padded,
      );

      return new Uint8Array(encrypted);
    }),
  );

  return {
    ciphertext: flattenUint8Array(cipherChunks),
    salt,
    serverPublic,
  };
}

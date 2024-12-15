import { deriveClientKeys } from './client-keys.js';
import { hkdf } from './hkdf.js';
import { createInfo, createInfo2 } from './info.js';
import { crypto } from './isomorphic-crypto.js';
import { ecJwkToBytes } from './jwk-to-bytes.js';
import { generateLocalKeys } from './local-keys.js';
import { getSalt } from './salt.js';
import type { PushSubscription } from './types.js';
import { arrayChunk, be16, flattenUint8Array, generateNonce } from './utils.js';

export interface EncryptedNotification {
  ciphertext: Uint8Array;
  salt: Uint8Array;
  localPublicKeyBytes: Uint8Array;
}

// See https://developer.chrome.com/blog/web-push-encryption/
export async function encryptNotification(
  subscription: PushSubscription,
  plaintext: Uint8Array,
): Promise<EncryptedNotification> {
  const clientKeys = await deriveClientKeys(subscription);
  const salt = await getSalt();

  // Local ephemeral keys
  const localKeys = await generateLocalKeys();
  const localPublicKeyBytes = ecJwkToBytes(localKeys.publicJwk);

  const sharedSecret = await crypto.subtle.deriveBits(
    {
      name: 'ECDH',
      // namedCurve: 'P-256',
      public: clientKeys.publicKey,
    },
    localKeys.privateKey,
    256,
  );

  // Infos
  const cekInfo = createInfo(
    clientKeys.publicKeyBytes,
    localPublicKeyBytes,
    'aesgcm',
  );
  const nonceInfo = createInfo(
    clientKeys.publicKeyBytes,
    localPublicKeyBytes,
    'nonce',
  );
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
    localPublicKeyBytes,
  };
}

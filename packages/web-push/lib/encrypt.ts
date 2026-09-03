import { deriveClientKeys } from './client-keys.js';
import { hkdf } from './hkdf.js';
import { createInfo, createKeyInfo } from './info.js';
import { generateLocalKeys } from './local-keys.js';
import { getSalt } from './salt.js';
import type { PushSubscription } from './types.js';
import { encodeRecordSize, invariant } from './utils.js';

const recordSize = 4096;

// RFC 8188 §2.1 header: salt, record size, key id length, key id
const headerSize = 21 + 65;

// a push service only has to accept 4096 octets in total, so the header shares
// the budget with the record. 17 is the padding delimiter plus the GCM tag
const maxPlaintextSize = recordSize - headerSize - 17;

export type EncryptOptions = {
  // pad every message out to a constant size, so the ciphertext length does
  // not disclose the plaintext length
  pad?: boolean;
};

// See https://www.rfc-editor.org/rfc/rfc8291
export async function encryptNotification(
  subscription: PushSubscription,
  plaintext: Uint8Array,
  options: EncryptOptions = {},
): Promise<Uint8Array<ArrayBuffer>> {
  invariant(
    plaintext.byteLength <= maxPlaintextSize,
    `Payload is ${plaintext.byteLength} bytes, the maximum is ${maxPlaintextSize}`,
  );

  const clientKeys = await deriveClientKeys(subscription);
  const salt = await getSalt();

  // Local ephemeral keys
  const localKeys = await generateLocalKeys();

  const sharedSecret = await crypto.subtle.deriveBits(
    {
      name: 'ECDH',
      public: clientKeys.publicKey,
    },
    localKeys.privateKey,
    256,
  );

  // Infos
  const keyInfo = createKeyInfo(
    clientKeys.publicKeyBytes,
    localKeys.publicKeyBytes,
  );
  const cekInfo = createInfo('aes128gcm');
  const nonceInfo = createInfo('nonce');

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

  const padTo = (options.pad ?? true) ? maxPlaintextSize : plaintext.byteLength;

  // 0x02 delimits the last record, any padding after it is zeroes
  const padded = new Uint8Array(padTo + 1);
  padded.set(plaintext);
  padded[plaintext.byteLength] = 0x02;

  const encrypted = await crypto.subtle.encrypt(
    {
      name: 'AES-GCM',
      iv: nonceBytes,
    },
    cekCryptoKey,
    padded,
  );

  // RFC 8188 §2.1 header, followed by the single record
  return new Uint8Array([
    ...salt,
    ...encodeRecordSize(recordSize),
    localKeys.publicKeyBytes.byteLength,
    ...localKeys.publicKeyBytes,
    ...new Uint8Array(encrypted),
  ]);
}

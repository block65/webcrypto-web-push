import { crypto } from './isomorphic-crypto.js';

export function deriveSharedSecret(
  publicKey: CryptoKey,
  privateKey: CryptoKey,
): Promise<ArrayBuffer> {
  return crypto.subtle.deriveBits(
    {
      name: 'ECDH',
      // namedCurve: 'P-256',
      public: publicKey,
    },
    privateKey,
    256,
  );
}

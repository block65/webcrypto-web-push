export function deriveSharedSecret(
  publicKey: CryptoKey,
  privateKey: CryptoKey,
): Promise<ArrayBuffer> {
  return crypto.subtle.deriveBits(
    {
      name: 'ECDH',
      // @ts-expect-error - cloudflare worker encryption types are wrong?
      // namedCurve: 'P-256',
      public: publicKey,
    },
    privateKey,
    256,
  );
}

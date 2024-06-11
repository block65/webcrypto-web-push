/// <reference lib="webworker" />
/// <reference types="node" />

const impl = globalThis.crypto
  ? globalThis.crypto
  : await import('node:crypto');

// we only export the values we use to keep things simple, we dont need a fully
// cross platform compatible crypto library
export const crypto = {
  getRandomValues: <T extends Uint8Array>(array: T) =>
    'webcrypto' in impl
      ? impl.webcrypto.getRandomValues(array)
      : impl.getRandomValues(array),
  subtle: 'webcrypto' in impl ? impl.webcrypto.subtle : impl.subtle,
};

export const CryptoKey =
  'webcrypto' in impl ? impl.webcrypto.CryptoKey : globalThis.CryptoKey;

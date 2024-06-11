import { crypto } from './isomorphic-crypto.js';

function createHMAC(data: ArrayBuffer) {
  if (data.byteLength === 0) {
    return {
      hash: () => Promise.resolve(new ArrayBuffer(32)),
    };
  }

  const keyPromise = crypto.subtle.importKey(
    'raw',
    data,
    {
      name: 'HMAC',
      hash: 'SHA-256',
    },
    true,
    ['sign'],
  );

  return {
    hash: async (input: ArrayBuffer) => {
      const k = await keyPromise;
      return crypto.subtle.sign('HMAC', k, input);
    },
  };
}

export async function hkdf(salt: ArrayBuffer, ikm: ArrayBuffer) {
  const prkhPromise = createHMAC(salt)
    .hash(ikm)
    .then((prk) => createHMAC(prk));

  return {
    extract: async (info: ArrayBuffer, len: number) => {
      const input = new Uint8Array([
        ...new Uint8Array(info),
        ...new Uint8Array([1]),
      ]);
      const prkh = await prkhPromise;
      const hash = await prkh.hash(input);
      // if (hash.byteLength < len) {
      //   throw new Error(
      //     `Unexpected hash length ${hash.byteLength} is less than ${len}`,
      //   );
      // }
      return hash.slice(0, len);
    },
  };
}

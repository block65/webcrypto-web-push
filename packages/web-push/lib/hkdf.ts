import { concatUint8Arrays } from 'uint8array-extras';

function createHMAC(data: BufferSource) {
  const keyPromise = crypto.subtle.importKey(
    'raw',
    data,
    {
      name: 'HMAC',
      hash: 'SHA-256',
    },
    false,
    ['sign'],
  );

  return {
    hash: async (input: BufferSource) => {
      const k = await keyPromise;
      return crypto.subtle.sign('HMAC', k, input);
    },
  };
}

export async function hkdf(salt: BufferSource, ikm: BufferSource) {
  const prkhPromise = createHMAC(salt)
    .hash(ikm)
    .then((prk) => createHMAC(prk));

  return {
    extract: async (info: Uint8Array, len: number) => {
      const prkh = await prkhPromise;

      // RFC 5869 expand, T(n) = HMAC(prk, T(n-1) || info || n)
      const blocks = await Array.from(
        { length: Math.ceil(len / 32) },
        (_, i) => i,
      ).reduce<Promise<Uint8Array[]>>(async (acc, i) => {
        const previous = await acc;
        const hash = await prkh.hash(
          new Uint8Array([...(previous.at(-1) ?? []), ...info, i + 1]),
        );
        return [...previous, new Uint8Array(hash)];
      }, Promise.resolve([]));

      return concatUint8Arrays(blocks).slice(0, len);
    },
  };
}

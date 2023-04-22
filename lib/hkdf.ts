export async function hkdf(salt: ArrayBuffer, ikm: ArrayBuffer) {
  const hmacParams = { name: 'HMAC', hash: 'SHA-256' };

  const key = await crypto.subtle.importKey('raw', salt, hmacParams, false, [
    'sign',
  ]);

  const prk = await crypto.subtle.sign(hmacParams.name, key, ikm);

  return {
    prk,
    extract: async (info: ArrayBuffer, length: number) => {
      const infoHmac = await crypto.subtle.sign(
        hmacParams.name,
        await crypto.subtle.importKey('raw', prk, hmacParams, false, ['sign']),
        new Uint8Array([...new Uint8Array(info), 0x01]),
      );

      return infoHmac.slice(0, length);
    },
  };
}

function createHMAC(key: ArrayBuffer) {
  const keyPromise = crypto.subtle.importKey(
    'raw',
    key,
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

export async function hkdf2(salt: ArrayBuffer, ikm: ArrayBuffer) {
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
      const h = await prkh.hash(input);
      if (h.byteLength < len) {
        throw new Error('Length is too long');
      }
      return h.slice(0, len);
    },
  };
}

export async function hkdf3(salt: ArrayBuffer, ikm: ArrayBuffer) {
  const hmacParams = { name: 'HMAC', hash: 'SHA-256' };

  const key = await crypto.subtle.importKey(
    'raw',
    ikm,
    { name: 'HKDF' },
    false,
    ['deriveBits'],
  );

  // const prk = await crypto.subtle.sign(hmacParams.name, key, ikm);

  return {
    // prk,
    extract: async (info: ArrayBuffer, length: number) => {
      const x = await crypto.subtle.deriveBits(
        { name: 'HKDF', salt, info, hash: hmacParams.hash },
        key,
        // eslint-disable-next-line no-bitwise
        length << 3,
      );

      return x.slice(0, length);
    },
  };
}

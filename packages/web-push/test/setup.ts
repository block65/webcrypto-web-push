import { base64ToUint8Array } from 'uint8array-extras';
import { afterEach, beforeEach, vi } from 'vitest';

vi.mock(import('../lib/salt.js'), async (importOriginal) => ({
  ...importOriginal,
  getSalt: async () => base64ToUint8Array('4CQCKEyyOT_LysC17rsMXQ'),
}));

vi.mock(import('../lib/local-keys.js'), (importOriginal) => ({
  generateLocalKeys: async () => {
    const insecurePublicJwk = {
      crv: 'P-256',
      ext: true,
      key_ops: ['deriveBits'],
      kty: 'EC',
      x: '7r5MIcg14B8yGrjhJAudH7c1mcB_B7af4KNwRJseU5w',
      y: 'Jkx_8JqbcwRJMd5zrZouJbIUe2AkFnhoDavSymNyOA0',
    } satisfies JsonWebKey;

    const insecurePrivateJwk = {
      ...insecurePublicJwk,
      d: 'yFSH4q5h6mJ2VMryum5Nl31luqJQO8zzUJyIwgn0vVk',
    } satisfies JsonWebKey;

    return {
      ...importOriginal,
      publicJwk: insecurePublicJwk,
      privateJwk: insecurePrivateJwk,
      privateKey: await crypto.subtle.importKey(
        'jwk',
        insecurePrivateJwk,
        { name: 'ECDH', namedCurve: 'P-256' },
        true,
        ['deriveBits'],
      ),
      publicKey: await crypto.subtle.importKey(
        'jwk',
        insecurePublicJwk,
        { name: 'ECDH', namedCurve: 'P-256' },
        true,
        [],
      ),
    };
  },
}));

beforeEach(() => {
  // tell vitest we use mocked time
  vi.useFakeTimers();
  // vi.setSystemTime(Date.UTC(2000, 1, 1, 13, 0, 0, 0));
});

afterEach(() => {
  // restoring date after each test run
  vi.useRealTimers();
  vi.clearAllMocks();
});

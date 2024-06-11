import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';
import { decodeBase64Url } from '../lib/cf-jwt/main.js';
import { buildPushPayload } from '../lib/payload.js';
import { fakeSubscriptions, fakeVapid } from './fixtures.js';

vi.mock('../lib/salt.js', () => ({
  getSalt: () => decodeBase64Url('4CQCKEyyOT_LysC17rsMXQ'),
}));

vi.mock('../lib/local-keys.js', () => ({
  generateLocalKeys: async () => {
    const publicJwk: JsonWebKey = {
      crv: 'P-256',
      ext: true,
      key_ops: ['deriveBits'],
      kty: 'EC',
      x: '7r5MIcg14B8yGrjhJAudH7c1mcB_B7af4KNwRJseU5w',
      y: 'Jkx_8JqbcwRJMd5zrZouJbIUe2AkFnhoDavSymNyOA0',
    };

    const privateJwk: JsonWebKey = {
      ...publicJwk,
      d: 'yFSH4q5h6mJ2VMryum5Nl31luqJQO8zzUJyIwgn0vVk',
    };

    return {
      publicJwk,
      privateKey: await crypto.subtle.importKey(
        'jwk',
        privateJwk,
        { name: 'ECDH', namedCurve: 'P-256' },
        true,
        ['deriveBits'],
      ),
      publicKey: await crypto.subtle.importKey(
        'jwk',
        publicJwk,
        { name: 'ECDH', namedCurve: 'P-256' },
        true,
        [],
      ),
    };
  },
}));

describe('', () => {
  beforeEach(() => {
    // tell vitest we use mocked time
    vi.useFakeTimers();
  });

  afterEach(() => {
    // restoring date after each test run
    vi.useRealTimers();
    vi.clearAllMocks();
  });

  test('buildPushPayload', async () => {
    vi.setSystemTime(Date.UTC(2000, 1, 1, 13, 0, 0, 0));

    const subscription = fakeSubscriptions.test;

    const requestInfo = await buildPushPayload(
      {
        data: 'This is test data.',
      },
      subscription,
      fakeVapid,
    );

    expect(requestInfo.body).toMatchSnapshot();
    expect(requestInfo.method).toMatchSnapshot();

    const { authorization, ...headers } = requestInfo.headers;
    expect(headers).toMatchSnapshot();
    expect(authorization.match(/^(WebPush \w+\.\w+?\.)/)).toMatchSnapshot();
  });
});

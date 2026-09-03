import { base64ToUint8Array } from 'uint8array-extras';
import { expect, test, vi } from 'vitest';
import { encodeBase64Url } from '../lib/base64.js';
import { buildPushPayload } from '../lib/main.js';
import { subscriptions } from './fixtures/fixtures.js';
import { insecureLocalJwk, insecureSalt } from './fixtures/local-keys.js';
import { insecureVapid } from './fixtures/vapid.js';

vi.mock(import('../lib/salt.js'), () => ({
  getSalt: async () => base64ToUint8Array(insecureSalt),
}));

vi.mock(import('../lib/local-keys.js'), () => ({
  generateLocalKeys: async () => ({
    publicKeyBytes: new Uint8Array([
      0x04,
      ...base64ToUint8Array(insecureLocalJwk.x),
      ...base64ToUint8Array(insecureLocalJwk.y),
    ]),
    privateKey: await crypto.subtle.importKey(
      'jwk',
      insecureLocalJwk,
      { name: 'ECDH', namedCurve: 'P-256' },
      false,
      ['deriveBits'],
    ),
  }),
}));

test('buildPushPayload', async () => {
  vi.setSystemTime(new Date(Date.UTC(2000, 1, 1, 13)));

  const requestInfo = await buildPushPayload(
    {
      data: 'This is test data.',
    },
    subscriptions.chrome,
    insecureVapid,
  );

  expect(encodeBase64Url(requestInfo.body.subarray(0, 86))).toMatchSnapshot();
  expect(requestInfo.body.byteLength).toBe(4096);
  expect(requestInfo.method).toMatchSnapshot();

  const { authorization, ...headers } = requestInfo.headers;
  expect(headers).toMatchSnapshot();
  expect(authorization.match(/^vapid t=(\w+\.\w+?\.)/)).toMatchSnapshot();
});

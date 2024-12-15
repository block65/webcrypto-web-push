import { expect, test, vi } from 'vitest';
import { buildPushPayload } from '../lib/main.js';
import { subscriptions } from './fixtures/fixtures.js';
import { insecureVapid } from './fixtures/vapid.js';

test('buildPushPayload', async () => {
  const subscription = subscriptions.chrome;

  const requestInfo = await buildPushPayload(
    {
      data: 'This is test data.',
    },
    subscription,
    insecureVapid,
  );

  expect(requestInfo.body).toMatchSnapshot();
  expect(requestInfo.method).toMatchSnapshot();

  const { authorization, ...headers } = requestInfo.headers;
  expect(headers).toMatchSnapshot();
  expect(authorization.match(/^(WebPush \w+\.\w+?\.)/)).toMatchSnapshot();
});

import { expect, test } from 'vitest';
import { type PushMessage, buildPushPayload } from '../lib/main.js';
import { subscriptions } from './fixtures/fixtures.js';
import { insecureVapid } from './fixtures/vapid.js';

test('Fake Chrome Subscription', async () => {
  const message: PushMessage = {
    data: 'Some text',
    options: {
      ttl: 60,
      // Topics are strings that can be used to replace a pending messages with
      // a new message if they have matching topic names
      topic: 'from-test-env',
      urgency: 'high',
    },
  };

  const subscription = subscriptions.chrome;

  const init = await buildPushPayload(message, subscription, insecureVapid);
  const res = await fetch(subscription.endpoint, init);

  await expect(res.text()).resolves.toMatchInlineSnapshot(`""`);
  expect(res.statusText).toMatchInlineSnapshot(`"Created"`);
  expect(res.status).toMatchInlineSnapshot(`201`);
});

test('Fake Edge Subscription', async () => {
  const message: PushMessage = {
    data: 'Some text',
    options: {
      ttl: 60,
      // Topics are strings that can be used to replace pending messages with
      // a new message if they have matching topic names
      topic: 'from-test-env',
      urgency: 'high',
    },
  };

  const subscription = subscriptions.edge;

  const init = await buildPushPayload(message, subscription, insecureVapid);
  const res = await fetch(subscription.endpoint, init);

  await expect(res.text()).resolves.toMatchInlineSnapshot('""');
  expect(res.statusText).toMatchInlineSnapshot(`"Created"`);
  expect(res.status).toMatchInlineSnapshot(`201`);

  // seemingly Edge specific headers, static so we can check them here
  expect(res.headers.get('x-wns-notificationstatus')).toBe('received');
  expect(res.headers.get('x-wns-status')).toBe('received');
});

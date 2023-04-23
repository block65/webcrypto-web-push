import { describe, expect, test } from 'vitest';
import { buildPushPayload } from '../lib/main.js';
import { type PushMessage } from '../lib/types.js';
import { fakeSubscriptions, fakeVapid } from './fixtures.js';

describe('Payload', () => {
  test('Fake Subscription', async () => {
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

    const subscription = fakeSubscriptions.test;

    const init = await buildPushPayload(message, subscription, fakeVapid);
    const res = await fetch(subscription.endpoint, init);

    await expect(res.text()).resolves.toMatchInlineSnapshot('""');
    expect(res.statusText).toMatchInlineSnapshot('"Created"');
    expect(res.status).toMatchInlineSnapshot('201');
  });
});

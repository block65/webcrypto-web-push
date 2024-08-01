import { describe, expect, test } from 'vitest';
import { buildPushPayload, type PushMessage } from '../lib/main.js';
import { fakeSubscriptions, fakeVapid } from './fixtures.js';

describe('Payload Integration', () => {
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

    const subscription = fakeSubscriptions.chrome;

    const init = await buildPushPayload(message, subscription, fakeVapid);
    const res = await fetch(subscription.endpoint, init);

    await expect(res.text()).resolves.toMatchInlineSnapshot('""');
    expect(res.statusText).toMatchInlineSnapshot('"Created"');
    expect(res.status).toMatchInlineSnapshot('201');
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

    const subscription = fakeSubscriptions.edge;

    const init = await buildPushPayload(message, subscription, fakeVapid);
    const res = await fetch(subscription.endpoint, init);

    await expect(res.text()).resolves.toMatchInlineSnapshot('""');
    expect(res.statusText).toMatchInlineSnapshot('"Created"');
    expect(res.status).toMatchInlineSnapshot('201');

    // seemingly Edge specific headers, static so we can check them here
    expect(res.headers.get('x-wns-notificationstatus')).toBe('received');
    expect(res.headers.get('x-wns-status')).toBe('received');
  });
});

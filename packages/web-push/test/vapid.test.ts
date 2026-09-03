import { expect, test, vi } from 'vitest';
import { vapidHeaders } from '../lib/vapid.js';
import { subscriptions } from './fixtures/fixtures.js';
import { insecureVapid } from './fixtures/vapid.js';

test('Headers', async () => {
  vi.setSystemTime(new Date(Date.UTC(2000, 1, 1, 13)));

  const { headers } = await vapidHeaders(subscriptions.chrome, insecureVapid);

  expect(headers.authorization).toMatch(
    new RegExp(
      `^vapid t=[\\w-]+\\.[\\w-]+\\.[\\w-]+, k=${insecureVapid.publicKey}$`,
    ),
  );
});

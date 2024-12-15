import { afterEach, beforeEach, describe, test, vi } from 'vitest';
import { vapidHeaders } from '../lib/vapid.js';
import { subscriptions } from './fixtures/fixtures.js';
import { insecureVapid } from './fixtures/vapid.js';

test('Headers', async () => {
  vi.setSystemTime(new Date(2000, 1, 1, 13));

  await vapidHeaders(subscriptions.chrome, insecureVapid);
});

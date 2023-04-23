/// <reference types="node" />

import { buildPushPayload } from '../lib/main.js';
import { notification, subscription, vapid } from './shared.js';

declare let fetch: typeof import('undici').fetch;

const init = await buildPushPayload(notification, subscription, vapid);
const res = await fetch(subscription.endpoint, init);

if (res.ok) {
  console.log(res.status, res.statusText, await res.text());
} else {
  throw new Error(
    `Push notification failed. HTTP ${res.status} ${res.statusText}}`,
  );
}

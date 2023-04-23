/// <reference types="node" />

import { buildPushPayload } from '../lib/main.js';
import { message, subscription, vapid } from './shared.js';

declare let fetch: typeof import('undici').fetch;

const init = await buildPushPayload(message, subscription, vapid);
const res = await fetch(subscription.endpoint, init);

if (res.ok) {
  console.log(res.status, res.statusText, await res.text());
} else {
  throw new Error(`Push failed. HTTP ${res.status} ${res.statusText}}`);
}

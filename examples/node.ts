/// <reference types="node" />
import { buildPushPayload } from '../lib/main.js';
import {
  exampleMessage,
  exampleSubscription,
  exampleVapid,
} from './fixtures.js';

const payload = await buildPushPayload(
  exampleMessage,
  exampleSubscription,
  exampleVapid,
);

const res = await fetch(exampleSubscription.endpoint, payload);

if (res.ok) {
  console.log(res.status, res.statusText, await res.text());
} else {
  throw new Error(`Push failed. HTTP ${res.status} ${res.statusText}}`);
}

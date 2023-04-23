/// <reference types="@cloudflare/workers-types" />
import { buildPushPayload } from '../lib/main.js';
import { message, subscription, vapid } from './shared.js';

interface Env {
  VAPID_SUBJECT: string;
  VAPID_SERVER_PUBLIC_KEY: string;
  VAPID_SERVER_PRIVATE_KEY: string;
}

export default {
  fetch: async function handleRequest() {
    try {
      const init = await buildPushPayload(message, subscription, vapid);

      const res = await fetch(subscription.endpoint, init);

      if (res.ok) {
        return new Response(
          `Push message sent successfully! HTTP ${res.status} ${res.statusText}}`,
        );
      }

      return new Response(
        `Push message send failed. HTTP ${res.status} ${res.statusText}}`,
      );
    } catch (err) {
      console.error(err);
      return new Response('Failed to send push message.', { status: 500 });
    }
  },
} satisfies ExportedHandler<Env>;

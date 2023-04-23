/// <reference types="@cloudflare/workers-types" />
import { buildPushPayload } from '../lib/main.js';
import { notification, subscription, vapid } from './shared.js';

interface Env {
  VAPID_SUBJECT: string;
  VAPID_SERVER_PUBLIC_KEY: string;
  VAPID_SERVER_PRIVATE_KEY: string;
}

export default {
  fetch: async function handleRequest() {
    try {
      const init = await buildPushPayload(notification, subscription, vapid);

      const res = await fetch(subscription.endpoint, init);

      if (res.ok) {
        return new Response(
          `Push notification sent successfully! HTTP ${res.status} ${res.statusText}}`,
        );
      }

      return new Response(
        `Push notification failed. HTTP ${res.status} ${res.statusText}}`,
      );
    } catch (err) {
      console.error(err);
      return new Response('Failed to send push notification.', { status: 500 });
    }
  },
} satisfies ExportedHandler<Env>;

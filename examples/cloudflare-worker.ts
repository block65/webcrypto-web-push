/// <reference types="@cloudflare/workers-types" />
import { buildPushPayload } from '../lib/main.js';
import { exampleMessage, exampleSubscription } from './shared.js';

interface Env {
  VAPID_SUBJECT: string;
  VAPID_SERVER_PUBLIC_KEY: string;
  VAPID_SERVER_PRIVATE_KEY: string;
}

export default {
  fetch: async (_req, env) => {
    try {
      // You would have this `exampleSubscription` stored in your own private
      // datastore, after receiving it from the client you with to push to.
      const subscription = exampleSubscription;

      const payload = await buildPushPayload(exampleMessage, subscription, {
        subject: env.VAPID_SUBJECT,
        publicKey: env.VAPID_SERVER_PUBLIC_KEY,
        privateKey: env.VAPID_SERVER_PRIVATE_KEY,
      });

      const res = await fetch(subscription.endpoint, payload);

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

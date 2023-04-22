import {
  buildPushPayload,
  type Notification,
  type PushSubscription,
  type VapidKeys,
} from '../lib/main.js';

interface Env {
  VAPID_SUBJECT: string;
  VAPID_SERVER_PUBLIC_KEY: string;
  VAPID_SERVER_PRIVATE_KEY: string;
}

export default {
  fetch: async function handleRequest(_, env) {
    const vapid: VapidKeys = {
      subject: env.VAPID_SUBJECT,
      publicKey: env.VAPID_SERVER_PUBLIC_KEY,
      privateKey: env.VAPID_SERVER_PRIVATE_KEY,
    };

    // You would probably get a subscription object from the datastore
    const subscription: PushSubscription = {
      endpoint: 'https://fcm.googleapis.com/fcm/send/...',
      expirationTime: null,
      keys: {
        p256dh: '...',
        auth: '...',
      },
    };

    const notification: Notification = {
      body: 'You have a new message!',
      options: {
        ttl: 60,
      },
    };

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

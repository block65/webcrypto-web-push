import type { PushMessage } from '@block65/webcrypto-web-push';
import { type FC, useCallback, useState } from 'react';
import { useRegisterSW } from 'virtual:pwa-register/react';
import { invariant } from './utils.ts';

async function getSubscription(
  registration: ServiceWorkerRegistration | undefined,
) {
  const sub = await registration?.pushManager.getSubscription();
  return sub || null;
}

// WARN: these keys are not secure, generate your own!
const publicKey = import.meta.env.VITE_SERVER_VAPID_PUBLIC_KEY;
const localServer = import.meta.env.VITE_SERVER_URL;

/**
 *
 * Just a deterministic way to get a stable id from the subscription.
 * You would probably use a user id?
 *
 * @param subscription
 * @returns
 */
async function subscriptionToSubscriptionId(
  subscription: PushSubscription,
): Promise<string> {
  const bytes = new TextEncoder().encode(subscription.endpoint);
  const buffer = await crypto.subtle.digest('sha-1', bytes);
  return Array.from(new Uint8Array(buffer))
    .map((byte) => byte.toString(16).padStart(2, '0'))
    .join('');
}

export const App: FC = () => {
  const [subscribeBusy, setSubscribeBusy] = useState(false);
  const [subscription, setSubscription] = useState<PushSubscription | null>(
    null,
  );
  const [registration, setRegistration] = useState<ServiceWorkerRegistration>();

  /**
   * Setup the service worker and existing sub
   */
  useRegisterSW({
    async onRegisteredSW(_, r) {
      setRegistration(r);
      setSubscription(await getSubscription(r));
    },
  });

  /**
   * Unsubscribe from push notifications.
   */
  const unsubscribe = useCallback(async () => {
    if (subscription) {
      const id = await subscriptionToSubscriptionId(subscription);
      await fetch(new URL(`/unsubscribe/${id}`, localServer), {
        method: 'delete',
      });

      await subscription.unsubscribe();

      setSubscription(null);
    }
  }, [subscription]);

  /**
   * Subscribe to push notifications.
   */
  const subscribe = useCallback(async () => {
    invariant(registration, 'no registration');

    setSubscribeBusy(true);
    const newSub = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: publicKey,
    });

    const id = await subscriptionToSubscriptionId(newSub);

    await fetch(new URL(`/subscribe/${id}`, localServer), {
      body: JSON.stringify(newSub),
      method: 'post',
      headers: {
        'content-type': 'application/json',
      },
    }).catch((err) => {
      unsubscribe();
      throw err;
    });

    setSubscription(newSub);

    setSubscribeBusy(false);
  }, [registration, unsubscribe]);

  /**
   * Send a push message to the current subscription.
   */
  const send = useCallback(async () => {
    invariant(subscription, 'no subscription');

    const p256dh = subscription.getKey('p256dh');
    invariant(p256dh, 'no p256dh');

    const auth = subscription.getKey('auth');
    invariant(auth, 'no auth');

    const id = await subscriptionToSubscriptionId(subscription);
    await fetch(new URL(`/send/${id}`, localServer), {
      method: 'post',
      headers: {
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        data: 'Hello! This can be anything you want including JSON',
        options: {
          topic: 'greet',
          ttl: 900,
          urgency: 'high',
        },
      } satisfies PushMessage),
    });
  }, [subscription]);

  return (
    <div className="flex-grow mx-auto m-15 max-w-screen-sm gap-4 flex flex-col">
      <h1 className="my-4 font-semibold text-xl">Web Push Example</h1>

      <div className="flex flex-col">
        <b>Server Public Key</b>
        <code className="font-mono fg">{publicKey}</code>
      </div>

      <div className="flex flex-col gap-4">
        <p className="flex flex-row gap-1">
          <span className="font-semibold">Service Worker Registered:</span>
          {registration ? 'Yes' : <span className="text-orange-600 ">No</span>}
        </p>

        <p className="flex flex-row gap-1">
          <span className="font-semibold">Subscribed:</span>{' '}
          {subscription ? 'Yes' : 'No'}
        </p>

        <div className="flex flex-row gap-4">
          <button
            className="bg-blue-500 hover:bg-blue-700 text-white py-2 px-4 rounded cursor-pointer flex-grow disabled:opacity-50"
            type="button"
            disabled={!registration || !!subscription}
            onClick={() => subscribe()}
          >
            {subscribeBusy ? 'busy' : 'Subscribe'}
          </button>

          <button
            className="bg-blue-500 hover:bg-blue-700 text-white py-2 px-4 rounded cursor-pointer flex-grow disabled:opacity-50"
            type="button"
            disabled={!registration || !subscription}
            onClick={() => unsubscribe()}
          >
            Unsubscribe
          </button>
        </div>

        <button
          className="bg-gray-500 hover:bg-gray-700 text-white py-2 px-4 rounded cursor-pointer flex-grow disabled:opacity-50"
          type="button"
          disabled={!registration || !subscription}
          onClick={() => send()}
        >
          Send Myself A Push Message
        </button>
      </div>
    </div>
  );
};

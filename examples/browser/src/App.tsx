import {
  Block,
  Button,
  Code,
  DesignSystem,
  Heading,
  Panel,
  Strong,
  Text,
  interFontThemeClassName,
} from '@block65/react-design-system';
import type { PushMessage } from '@block65/webcrypto-web-push';
import { useCallback, useState, type FC } from 'react';
import { useRegisterSW } from 'virtual:pwa-register/react';

function invariant<T>(
  condition: T | undefined | null | '' | 0 | false,
  message: string,
): asserts condition {
  if (!condition) {
    throw new Error(message);
  }
}

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
    <DesignSystem
      flexDirection="column"
      className={interFontThemeClassName}
      style={{ minHeight: '100%' }}
    >
      <Block
        flexGrow
        alignSelf="center"
        margin="10"
        style={{ maxWidth: '30rem' }}
      >
        <Heading level="2">Web Push</Heading>

        <Panel>
          <Strong>Server Public Key</Strong>
          <Code>{publicKey}</Code>
        </Panel>

        <Panel>
          <Text>
            <Strong>Service Worker Registered</Strong>: {String(!!registration)}
          </Text>

          <Text>
            <Strong>Subscribed</Strong>: {String(!!subscription)}
          </Text>

          <Button
            busy={subscribeBusy}
            disabled={!registration || !!subscription}
            onClick={() => subscribe()}
          >
            Subscribe
          </Button>
          <Button
            disabled={!registration || !subscription}
            onClick={() => unsubscribe()}
          >
            Unsubscribe
          </Button>
        </Panel>

        <Button
          disabled={!registration || !subscription}
          onClick={() => send()}
        >
          Send Myself A Push Message
        </Button>
      </Block>
    </DesignSystem>
  );
};

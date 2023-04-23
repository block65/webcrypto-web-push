import { encodeBase64Url } from './base64.js';
import { encryptNotification } from './encrypt.js';
import type { PushNotification, PushSubscription } from './types.js';
import { vapidHeaders, type VapidKeys } from './vapid.js';

export async function buildPushPayload(
  notification: PushNotification,
  subscription: PushSubscription,
  vapid: VapidKeys,
) {
  const { headers } = await vapidHeaders(subscription, vapid);

  const encrypted = await encryptNotification(
    subscription,
    new TextEncoder().encode(
      // if its a primitive, convert to string, otherwise stringify
      typeof notification.data === 'string' ||
        typeof notification.data === 'number'
        ? notification.data.toString()
        : JSON.stringify(notification.data),
    ),
  );

  return {
    headers: {
      ...headers,

      'crypto-key': `keyid=p256dh;dh=${encodeBase64Url(
        encrypted.localPublicKeyBytes,
      )};${headers['crypto-key']}`,

      encryption: `keyid=p256dh;salt=${encodeBase64Url(encrypted.salt)}`,

      ttl: (notification.options?.ttl || 60).toString(),
      ...(notification.options?.urgency && {
        urgency: notification.options.urgency,
      }),
      ...(notification.options?.topic && {
        topic: notification.options.topic,
      }),

      'content-encoding': 'aesgcm',
      'content-length': encrypted.ciphertext.byteLength.toString(),
      'content-type': 'application/octet-stream',
    },
    method: 'post',
    body: encrypted.ciphertext,
  };
}

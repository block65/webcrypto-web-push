import { encodeBase64Url } from './base64.js';
import { encryptNotification } from './encrypt.js';
import type { Notification, PushSubscription } from './types.js';
import { vapidHeaders, type VapidKeys } from './vapid.js';

export async function buildPushPayload(
  notification: Notification,
  subscription: PushSubscription,
  vapid: VapidKeys,
) {
  const encrypted = await encryptNotification(
    subscription,
    new TextEncoder().encode(
      // if its a primitive, convert to string, otherwise stringify
      typeof notification.body === 'string' ||
        typeof notification.body === 'number'
        ? notification.body.toString()
        : JSON.stringify(notification.body),
    ),
  );

  const { headers } = await vapidHeaders(subscription, vapid);

  return {
    headers: {
      ...headers,

      'crypto-key': `keyid=p256dh;dh=${encodeBase64Url(
        encrypted.serverPublic,
      )};${headers['crypto-key']}`,

      encryption: `keyid=p256dh;salt=${encodeBase64Url(encrypted.salt)}`,

      ttl: notification.options.ttl.toString(),
      ...(notification.options.urgency && {
        urgency: notification.options.urgency,
      }),
      ...(notification.options.topic && {
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

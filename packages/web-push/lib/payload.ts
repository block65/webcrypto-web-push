import { stringToUint8Array, uint8ArrayToBase64 } from 'uint8array-extras';
import { encryptNotification } from './encrypt.js';
import type { PushMessage, PushSubscription } from './types.js';
import { vapidHeaders, type VapidKeys } from './vapid.js';
import { toBase64UrlSafe } from './base64.js';

export async function buildPushPayload(
  message: PushMessage,
  subscription: PushSubscription,
  vapid: VapidKeys,
) {
  const { headers } = await vapidHeaders(subscription, vapid);

  const encrypted = await encryptNotification(
    subscription,
    stringToUint8Array(
      // if its a primitive, convert to string, otherwise stringify
      typeof message.data === 'string' || typeof message.data === 'number'
        ? message.data.toString()
        : JSON.stringify(message.data),
    ),
  );

  return {
    headers: {
      ...headers,

      'crypto-key': `dh=${toBase64UrlSafe(encrypted.localPublicKeyBytes)};${headers['crypto-key']}`,

      encryption: `salt=${toBase64UrlSafe(encrypted.salt)}`,

      ttl: (message.options?.ttl || 60).toString(),
      ...(message.options?.urgency && {
        urgency: message.options.urgency,
      }),
      ...(message.options?.topic && {
        topic: message.options.topic,
      }),

      'content-encoding': 'aesgcm',
      'content-length': encrypted.ciphertext.byteLength.toString(),
      'content-type': 'application/octet-stream',
    },
    method: 'post',
    body: encrypted.ciphertext,
  };
}

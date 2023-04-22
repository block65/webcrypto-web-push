# @block65/webcrypto-web-push

Send notifications using Web Push Protocol and Web Crypto APIs (compatible with
Cloudflare Workers)

## Installation

Using yarn:

```
yarn add @block65/webcrypto-web-push
```

Using pnpm:

```
pnpm add @block65/webcrypto-web-push
```

## Usage

```typescript
import {
  type PushSubscription,
  type Notification,
  type VapidKeys
  sendPushNotification,
} from '@block65/webcrypto-web-push';

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

// send the payload using your favourite fetch library
const init = await buildPushPayload(notification, subscription, vapid);
const res = await fetch(subscription.endpoint, init);
```

## License

This package is licensed under the MIT license. See the LICENSE file for more information.

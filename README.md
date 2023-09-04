# @block65/webcrypto-web-push

Send notifications using Web Push Protocol and Web Crypto APIs (compatible with
both Node and Cloudflare Workers)

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
  type PushMessage,
  type VapidKeys
  buildPushPayload,
} from '@block65/webcrypto-web-push';

const vapid: VapidKeys = {
  subject: env.VAPID_SUBJECT,
  publicKey: env.VAPID_SERVER_PUBLIC_KEY,
  privateKey: env.VAPID_SERVER_PRIVATE_KEY,
};

const subscription: PushSubscription = {
  endpoint: 'https://fcm.googleapis.com/fcm/send/...',
  expirationTime: null,
  keys: {
    p256dh: '...',
    auth: '...',
  },
};

const message: PushMessage = {
  body: "You've got mail!",
  options: {
    ttl: 60,
  },
};

const init = await buildPushPayload(message, subscription, vapid);

// send the payload using your favourite HTTP client
const res = await fetch(subscription.endpoint, init);
```

## License

This package is licensed under the MIT license. See the LICENSE file for more information.

# @block65/webcrypto-web-push

Send notifications using Web Push Protocol and Web Crypto APIs (works with
NodeJS, Cloudflare Workers, Bun and Deno)

## Installation

Using yarn:

```
yarn add @block65/webcrypto-web-push
```

Using pnpm:

```
pnpm add @block65/webcrypto-web-push
```

## Configuration

### Typescript

> **Note**
> This is an ESM package. If you are using Typescript, you will need
> to set `moduleResolution` to `node16`, `nodenext` or `bundler` in order to
> resolve the package exports.

## Usage

```typescript
import {
  buildPushPayload,
  type PushSubscription,
  type PushMessage,
  type VapidKeys,
} from '@block65/webcrypto-web-push';

// `env` could be `process.env` or `import.meta.env` depending
// on your platform or build tooling
const vapid: VapidKeys = {
  subject: env.VAPID_SUBJECT,
  publicKey: env.VAPID_SERVER_PUBLIC_KEY,
  privateKey: env.VAPID_SERVER_PRIVATE_KEY,
};

// Obtained from the client using PushManager subscribe() method:
// https://developer.mozilla.org/en-US/docs/Web/API/PushManager/subscribe
const subscription: PushSubscription = {
  endpoint: 'https://fcm.googleapis.com/fcm/send/...',
  expirationTime: null,
  keys: {
    p256dh: '...',
    auth: '...',
  },
};

const message: PushMessage = {
  data: "You've got mail!",
  options: {
    ttl: 60,
  },
};

const payload = await buildPushPayload(message, subscription, vapid);

// send the payload to the subscription endpoint using your favourite HTTP client
const res = await fetch(subscription.endpoint, payload);

console.log(res.status); // 201
```

## License

This package is licensed under the MIT license. See the LICENSE file for more
information.

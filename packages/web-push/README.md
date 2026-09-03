# @block65/webcrypto-web-push

Send notifications using Web Push Protocol and Web Crypto APIs (works with
NodeJS, Cloudflare Workers, Bun and Deno)

Messages are encrypted with `aes128gcm` as specified in
[RFC 8291](https://www.rfc-editor.org/rfc/rfc8291), and authenticated with the
VAPID `vapid` scheme from
[RFC 8292](https://www.rfc-editor.org/rfc/rfc8292). Both are accepted by every
current push service, including Apple.

Every message is padded to a constant 4096 octets, so the ciphertext length does
not disclose the plaintext length, and the body stays within the size a push
service is obliged to accept. The maximum payload is therefore 3993 bytes.
Subscription endpoints must be `https`.

## Installation

Using pnpm:

```
pnpm add @block65/webcrypto-web-push
```

Using npm:

```
npm install @block65/webcrypto-web-push
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

## Upgrading from 1.x

The API is unchanged. Version 1.x sent the legacy `aesgcm` content encoding and
the draft `WebPush` authorization scheme, neither of which Apple accepts.
Consumers that need the `aesgcm` encoding should stay on 1.x.

## License

This package is licensed under the MIT license. See the LICENSE file for more
information.

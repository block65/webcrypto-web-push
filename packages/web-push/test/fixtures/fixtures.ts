import type { PushSubscription } from '../../lib/types.js';

// WARN: the endpoint is not a live subscription, no test sends to it
export const subscriptions = {
  chrome: {
    endpoint: 'https://push.example.com/push/receipt',
    expirationTime: null,
    keys: {
      p256dh:
        'BGPknDTtnF3sW5XPDzZl9DD2YqFY0WsyqZJ2Pxrzq8x1HY-5aF2aRiCz_QKDY2nj-ZFtqdBwRsV9yoPRg_015Vo',
      auth: 'ynfeyAwBSXODSCaeRNQZiw',
    },
  },
} satisfies Record<string, PushSubscription>;

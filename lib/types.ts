// eslint-disable-next-line import/no-extraneous-dependencies
import type { Jsonifiable, RequireAtLeastOne } from 'type-fest';

export interface PushMessage {
  data: Jsonifiable;

  options?: RequireAtLeastOne<{
    // TTL (or time to live) is an integer specifying the number of seconds
    // you want your push message to live on the push service before it's
    // delivered. When the TTL expires, the message will be removed from the
    // push service queue and it won't be delivered.
    ttl?: number;

    // Topics are strings that can be used to replace a pending messages with
    // a new message if they have matching topic names.
    topic?: string;

    // Urgency indicates to the push service how important a message is to the
    // user. This can be used by the push service to help conserve the battery
    // life of a user's device by only waking up for important messages when
    // battery is low.
    urgency?: 'low' | 'normal' | 'high';
  }>;
}

export interface PushSubscription {
  endpoint: string;
  expirationTime: null | unknown;
  keys: {
    auth: string; // secret
    p256dh: string; // key
  };
}

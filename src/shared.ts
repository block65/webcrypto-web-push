import {
  type PushNotification,
  type PushSubscription,
  type VapidKeys,
} from '../lib/main.js';

export const vapid: VapidKeys = {
  subject: 'mailto:test@test.test',
  publicKey:
    'BKKXE3jJV5UJ6c8HVPam6DvMPGZK26r-M7ojsO2T_KdjdeMT2d7oQpaO-VI3o3wn33mQ8JlHta3OSJ5f67Ac5ZY',
  privateKey: 'VvFbnS5QlP5PcJzYyEpRQj93SFJetREtqqzbGAfK3RE',
};

export const subscription: PushSubscription = {
  endpoint:
    'https://fcm.googleapis.com/fcm/send/fsy7jmarsUw:APA91bGW9NHHHkulPFRUclKDHx5MYuXn0jZ23r4cPkHtwQ8nMjxXpkfEWW4LdUugsNMCHKGooY3nD-rou0nKGHz_qkl5nhxbIGTXgw7N21nn3TbPJnaLcRR-Lc-kxS7Q6KOlCUwER03U',
  expirationTime: null,
  keys: {
    p256dh:
      'BIHM_TeHSCQR0eutJWAHSw-UIGsJwM5p8MCEtkk4wXWNRI0iEn0TmWS_IYfnvJ3pX3xtCfnc0F5Amjgrn1oQ-1U',
    auth: '2IHJlak0C-_dmapE4qBLmA',
  },
};

export const notification: PushNotification = {
  data: 'You have a new message!',
  options: {
    ttl: 60,
  },
};

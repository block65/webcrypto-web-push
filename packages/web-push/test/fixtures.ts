import type { PushSubscription } from '../lib/types.js';

export const fakeSubscriptions = {
  chrome: {
    endpoint:
      'https://fcm.googleapis.com/fcm/send/fL4MGn77FGc:APA91bE9RjT5iS_lfuBIm7PeOS2789EzyWGbUrh-viIAgsGbJIG-Rc65ipPt8hFS6aLwiyvyfXsSIVTZTuISxPUo3kcaklfv_WYpZ4g1g8jY6wChNoHkRmDpGN7qFgI2SkrV2SxYlL-r',
    expirationTime: null,
    keys: {
      p256dh:
        'BJSK63fSr4N3Vrx2DPFmRrGLglmDOZBFy5AwUDINlEFMQYHjDS2YjZbIYTuOGQVp4ZbzJKki6cCYcKsMHSBF9-Y',
      auth: 'lzqdvQzre8BPRpJTvFJZng',
    },
  },
  edge: {
    endpoint:
      'https://wns2-sg2p.notify.windows.com/w/?token=BQYAAAAOqpMScCyZs07b3Rhi7WoqEBYPH9pHcOxdJ7lGF0E9YcvLHxBniuEp3FT3%2fHyZcyP%2fCPuqaZSQcIs%2bHn%2f5aQAk9l1BwojHAE2ZRuzMWEClZzdm3A661RAujyNyEoVeKjeTL872YTFMxb0AeEWrAMhQ969Pm9Pq93yunKqL8N0vcCwJ%2bSuznNCzDZgbAst2l2EWbDqRUeUClJxozU9SFowOV0ypMdluq%2bionNVEpJYo2JmnJs%2bQbVUv4MAH%2fKx3pe4CftTkDkgqWWcMhBkVwpexn6%2bNo7F5Ae1kM1vFhruf6%2f4Rc47cqvwSsbmcxj3MhGI%3d',
    expirationTime: null,
    keys: {
      p256dh:
        'BOHAcPFrsyWQchMJfijwJbLMV2HVBZHumzQPcgj_hhuXpbqaQunE09dRbWOasPW13e2K7RzQNVoJ7z1iXAFrypY',
      auth: 'KxoJGb-hSSi8QFDyld-P7Q',
    },
  },
} satisfies Record<string, PushSubscription>;

// WARN: these keys are not secure, generate your own!
export const fakeVapid = {
  subject: 'mailto:test@test.test',
  publicKey:
    'BKKXE3jJV5UJ6c8HVPam6DvMPGZK26r-M7ojsO2T_KdjdeMT2d7oQpaO-VI3o3wn33mQ8JlHta3OSJ5f67Ac5ZY',
  privateKey: 'VvFbnS5QlP5PcJzYyEpRQj93SFJetREtqqzbGAfK3RE',
};

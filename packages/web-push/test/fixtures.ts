import type { PushSubscription } from '../lib/types.js';

export const fakeSubscriptions = {
  test: {
    endpoint:
      'https://fcm.googleapis.com/fcm/send/fL4MGn77FGc:APA91bE9RjT5iS_lfuBIm7PeOS2789EzyWGbUrh-viIAgsGbJIG-Rc65ipPt8hFS6aLwiyvyfXsSIVTZTuISxPUo3kcaklfv_WYpZ4g1g8jY6wChNoHkRmDpGN7qFgI2SkrV2SxYlL-r',
    expirationTime: null,
    keys: {
      p256dh:
        'BJSK63fSr4N3Vrx2DPFmRrGLglmDOZBFy5AwUDINlEFMQYHjDS2YjZbIYTuOGQVp4ZbzJKki6cCYcKsMHSBF9-Y',
      auth: 'lzqdvQzre8BPRpJTvFJZng',
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

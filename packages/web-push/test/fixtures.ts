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
      'https://wns2-sg2p.notify.windows.com/w/?token=BQYAAAALwNoB%2fBFE0R6H%2bayc5WRfMVkJlB3mHXSmsCTKWeZZM%2faOvneI8DaE%2fQeCC6uE17dj%2bPNz9drmi5bEvrNRTs8hzCS2abTpc4lfS9XbebI8lqe%2bXcPerho8q5SnWcTk4GURFakuZUYI6e0xMnTG%2bpvFxFatlhq4CELEEyo9%2fAP%2fHMx8tPCSXsh3sSFDtx6MkDnMHmR%2fUvcCrnLbXCDiseZ40bQI6a5tRmOM0izm0Gfc%2foKWmce8JUk2TRtm%2fecPR1F0X%2bVj4JQsDAR7Kx56HUCONLNMzuVm%2b9O6Yp1bLUfnp1QJyVOVyyj6DQfG%2bOOsikh%2bd2foJpWHggpFenW3NiT3',
    expirationTime: null,
    keys: {
      p256dh:
        'BDPQRxcMhoXtPqJvQ9Kp-FGsQexasWXvh0RTE15Y0qbxKLFZ6eG3U90RJQFkb_SdAB_YzbIm7hcvzn1yAzNZbxs',
      auth: 'XGCMxdgIGIp7SNs3kb4x7g',
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

import { chromium, firefox, type BrowserContext } from '@playwright/test';

type Launch = (profileDir: string) => Promise<BrowserContext>;

export const browsers: Record<string, Launch> = {
  // playwright's bundled chromium has no FCM credentials, so this needs a real
  // chrome install. the push api is also unavailable in incognito, which is
  // what a non-persistent context gives you
  chrome: (profileDir) =>
    chromium.launchPersistentContext(profileDir, {
      channel: 'chrome',
      permissions: ['notifications'],
    }),

  firefox: (profileDir) =>
    firefox.launchPersistentContext(profileDir, {
      permissions: ['notifications'],
      firefoxUserPrefs: {
        'dom.push.enabled': true,
        'dom.push.connection.enabled': true,
        'dom.push.serverURL': 'wss://push.services.mozilla.com/',
        'permissions.default.desktop-notification': 1,
      },
    }),
};

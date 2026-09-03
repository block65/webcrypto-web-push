import assert from 'node:assert/strict';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { test } from 'node:test';
import { buildPushPayload } from '@block65/webcrypto-web-push';
import { browsers } from './browsers.ts';
import { serveFixture } from './server.ts';
import { insecureVapid } from './vapid.ts';

for (const [name, launch] of Object.entries(browsers)) {
  test(
    `${name} subscribes, and decrypts what we send it`,
    { timeout: 120_000 },
    async (ctx) => {
      const profileDir = await mkdtemp(join(tmpdir(), `web-push-${name}-`));
      const context = await launch(profileDir).catch((err: Error) => err);

      if (context instanceof Error) {
        // a browser that is not installed is not a failing library
        ctx.skip(`${name} did not launch: ${context.message.split('\n')[0]}`);
        return;
      }

      const fixture = await serveFixture();

      try {
        const page = await context.newPage();
        await page.goto(fixture.url);

        const subscription = await page.evaluate(async (publicKey) => {
          const registration = await navigator.serviceWorker.register('/sw.js');
          await navigator.serviceWorker.ready;

          const pushSubscription = await registration.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey: Uint8Array.from(
              atob(publicKey.replace(/-/g, '+').replace(/_/g, '/')),
              (character) => character.charCodeAt(0),
            ),
          });

          const { endpoint, expirationTime, keys } = pushSubscription.toJSON();

          if (!endpoint || !keys?.['auth'] || !keys['p256dh']) {
            throw new Error('Push service returned an incomplete subscription');
          }

          return {
            endpoint,
            expirationTime: expirationTime ?? null,
            keys: { auth: keys['auth'], p256dh: keys['p256dh'] },
          };
        }, insecureVapid.publicKey);

        const message = `sent at ${Date.now()}`;
        const payload = await buildPushPayload(
          { data: message, options: { ttl: 60 } },
          subscription,
          insecureVapid,
        );

        assert.equal(payload.headers['content-encoding'], 'aes128gcm');
        assert.equal(payload.body.byteLength, 4096);

        const res = await fetch(subscription.endpoint, payload);
        assert.equal(res.status, 201);

        // the subscriber decrypting it is the whole point. a 201 only means the
        // push service accepted the request
        await page.waitForFunction(
          (expected) => document.title === expected,
          message,
        );
      } finally {
        await context.close();
        await fixture.close();
        await rm(profileDir, { recursive: true, force: true });
      }
    },
  );
}

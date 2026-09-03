import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { buildPushPayload } from '@block65/webcrypto-web-push';
import { expect, test } from 'vitest';
import { browsers } from './browsers.js';
import { serveFixture } from './server.js';
import { insecureVapid } from './vapid.js';

declare global {
  interface Window {
    pushed: Promise<string>;
    subscribe: (publicKey: string) => Promise<{
      endpoint: string;
      expirationTime: number | null;
      keys: { auth: string; p256dh: string };
    }>;
  }
}

for (const [name, launch] of Object.entries(browsers)) {
  test(`${name} subscribes, and decrypts what we send it`, async (ctx) => {
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

      const subscription = await page.evaluate(
        (publicKey) => window.subscribe(publicKey),
        insecureVapid.publicKey,
      );

      expect(subscription.keys.p256dh).toBeTruthy();

      const message = `sent at ${Date.now()}`;
      const payload = await buildPushPayload(
        { data: message, options: { ttl: 60 } },
        subscription,
        insecureVapid,
      );

      expect(payload.headers['content-encoding']).toBe('aes128gcm');
      expect(payload.body.byteLength).toBe(4096);

      const res = await fetch(subscription.endpoint, payload);
      expect(res.status).toBe(201);

      // the subscriber decrypting it is the whole point. a 201 only means the
      // push service accepted the request
      await expect(page.evaluate(() => window.pushed)).resolves.toBe(message);
    } finally {
      await context.close();
      await fixture.close();
      await rm(profileDir, { recursive: true, force: true });
    }
  });
}

import 'dotenv/config';
import {
  buildPushPayload,
  type PushSubscription,
} from '@block65/webcrypto-web-push';
import { serve } from '@hono/node-server';
import Database from 'better-sqlite3';
import { eq } from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import { migrate } from 'drizzle-orm/better-sqlite3/migrator';
import { Hono } from 'hono';
import { env } from 'hono/adapter';
import { cors } from 'hono/cors';
import { HTTPException } from 'hono/http-exception';
import { logger } from 'hono/logger';
import { subscriptions } from './schema.js';

const app = new Hono();

type Env = {
  VAPID_SUBJECT: string;
  VAPID_SERVER_PUBLIC_KEY: string;
  VAPID_SERVER_PRIVATE_KEY: string;
};

app.use(
  cors({
    origin: '*',
  }),
);
app.use(logger());

const db = drizzle(
  new Database(new URL('../data/sqlite.db', import.meta.url).pathname),
);

await migrate(db, {
  migrationsFolder: new URL('../migrations', import.meta.url).pathname,
});

app.get('/', (c) => c.text('hi!'));

app.post('/subscribe/:id', async (c) => {
  const body = await c.req.json<PushSubscription>();

  const subscription = db
    .insert(subscriptions)
    .values({
      id: c.req.param('id'),
      endpoint: body.endpoint,
      expirationTime: body.expirationTime,
      keys: body.keys,
    })
    .returning()
    .get();

  return c.json({
    id: subscription.id,
  });
});

app.delete('/unsubscribe/:id', async (c) => {
  const subscription = await db
    .delete(subscriptions)
    .where(eq(subscriptions.id, c.req.param('id')))
    .returning()
    .get();

  return c.json({
    id: subscription?.id,
  });
});

app.post('/send/:id', async (c) => {
  const subscription = await db
    .select()
    .from(subscriptions)
    .where(eq(subscriptions.id, c.req.param('id')))
    .get();

  if (!subscription) {
    throw new HTTPException(404, { message: 'Subscription not found' });
  }

  // const exampleMessage = await c.req.json<PushMessage>();
  const exampleMessage = {
    data: 'Hello! This can be anything you want including JSON',
    options: { topic: 'greet', ttl: 900, urgency: 'high' as const },
  };

  const e = env<Env>(c);
  const payload = await buildPushPayload(exampleMessage, subscription, {
    subject: e.VAPID_SUBJECT,
    publicKey: e.VAPID_SERVER_PUBLIC_KEY,
    privateKey: e.VAPID_SERVER_PRIVATE_KEY,
  });

  const res = await fetch(subscription.endpoint, payload);

  return c.json({
    endpointStatus: res.status,
  });
});

app.onError((err, c) => {
  console.error(err);
  c.status(500);
  return c.json({
    message: err.message,
  });
});

serve({ fetch: app.fetch, port: 3065 }, (info) => {
  console.log(`Listening on http://localhost:${info.port}`); // Listening on http://localhost:3065
});

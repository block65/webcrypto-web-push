import {
  buildPushPayload,
  type PushSubscription,
} from '@block65/webcrypto-web-push';
import { eq } from 'drizzle-orm';
import { drizzle, type DrizzleD1Database } from 'drizzle-orm/d1';
import { Hono } from 'hono';
import { env } from 'hono/adapter';
import { cors } from 'hono/cors';
import { createMiddleware } from 'hono/factory';
import { HTTPException } from 'hono/http-exception';
import { subscriptions } from './schema.js';

const app = new Hono<{
  Variables: {
    db: DrizzleD1Database;
  };
  Bindings: Env;
}>();

app.use(
  cors({
    origin: '*',
  }),
);

const injectDbContext = createMiddleware(async (c, next) => {
  c.set('db', drizzle(env(c).DB));
  return next();
});

app.get('/', (c) => c.text('hi!'));

app.post('/subscribe/:id', injectDbContext, async (c) => {
  const body = await c.req.json<PushSubscription>();

  const subscription = await c
    .get('db')
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

app.delete('/unsubscribe/:id', injectDbContext, async (c) => {
  const subscription = await c
    .get('db')
    .delete(subscriptions)
    .where(eq(subscriptions.id, c.req.param('id')))
    .returning()
    .get();

  return c.json({
    id: subscription?.id,
  });
});

app.post('/send/:id', injectDbContext, async (c) => {
  const subscription = await c
    .get('db')
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

  const payload = await buildPushPayload(exampleMessage, subscription, {
    subject: env(c).VAPID_SUBJECT,
    publicKey: env(c).VAPID_SERVER_PUBLIC_KEY,
    privateKey: env(c).VAPID_SERVER_PRIVATE_KEY,
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

export default {
  fetch: app.fetch,
} satisfies ExportedHandler<Env>;

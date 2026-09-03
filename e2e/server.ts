import { serve } from '@hono/node-server';
import { serveStatic } from '@hono/node-server/serve-static';
import { Hono } from 'hono';

// a service worker needs a secure context, and http://localhost counts as one
export async function serveFixture() {
  const app = new Hono();
  app.use('/*', serveStatic({ root: './public' }));

  const server = await new Promise<ReturnType<typeof serve>>((resolve) => {
    const listening = serve({ fetch: app.fetch, port: 0 }, () =>
      resolve(listening),
    );
  });

  const address = server.address();

  if (address === null || typeof address === 'string') {
    throw new Error('Server was not given a port');
  }

  return {
    url: `http://localhost:${address.port}/`,
    close: () => server.close(),
  };
}

import { once } from 'node:events';
import { readFile } from 'node:fs/promises';
import { createServer, type Server } from 'node:http';

const types: Record<string, string> = {
  '/': 'text/html',
  '/sw.js': 'text/javascript',
};

// a service worker needs a secure context, and http://localhost counts as one
export async function serveFixture() {
  const server = createServer(async (req, res) => {
    const path = req.url === '/sw.js' ? '/sw.js' : '/';
    const file = new URL(
      `./public${path === '/' ? '/index.html' : path}`,
      import.meta.url,
    );

    res.writeHead(200, { 'content-type': types[path] });
    res.end(await readFile(file));
  });

  server.listen(0);
  await once(server, 'listening');

  const address = server.address();
  if (address === null || typeof address === 'string') {
    throw new Error('Server was not given a port');
  }

  return {
    url: `http://localhost:${address.port}/`,
    close: () => closeServer(server),
  };
}

function closeServer(server: Server) {
  return new Promise<void>((resolve, reject) => {
    server.close((err) => (err ? reject(err) : resolve()));
  });
}

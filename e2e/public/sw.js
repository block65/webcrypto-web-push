self.addEventListener('push', (event) => {
  const text = event.data ? event.data.text() : '';

  event.waitUntil(
    (async () => {
      const clients = await self.clients.matchAll({
        includeUncontrolled: true,
        type: 'window',
      });

      for (const client of clients) {
        // oxlint-disable-next-line unicorn/require-post-message-target-origin -- Client.postMessage has no origin argument
        client.postMessage(text);
      }
    })(),
  );
});

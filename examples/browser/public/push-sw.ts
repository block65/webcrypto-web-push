self.addEventListener('push', async (event) => {
  // Keep the service worker alive until the notification is shown.
  event.waitUntil(
    self.registration.pushManager.getSubscription().then((subscription) => {
      if (!subscription) {
        throw new Error('No subscription found.');
      }

      self.registration.showNotification('Web Push', {
        // event.data?.json()
        body: event.data?.text() || '<empty>',
        requireInteraction: false, // can dismiss itself automatically
      });
    }),
  );
});

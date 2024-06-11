"use strict";
/// <reference lib="webworker" />
selfie.addEventListener('push', async (event) => {
    // Keep the service worker alive until the notification is shown.
    event.waitUntil(selfie.registration.pushManager.getSubscription().then((subscription) => {
        if (!subscription) {
            throw new Error('No subscription found.');
        }
        selfie.registration.showNotification('Web Push', {
            // event.data?.json()
            body: event.data?.text() || '<empty>',
            requireInteraction: false, // can dismiss itself automatically
        });
    }));
});

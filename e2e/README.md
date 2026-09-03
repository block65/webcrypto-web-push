# e2e

Subscribes a real browser to its real push service, sends a notification with
`@block65/webcrypto-web-push`, and asserts the service worker decrypted it. A
`201` from a push service only means the request was accepted, so this is the
only test that shows a subscriber can read what the library produces.

It is not part of `make test` and does not run in CI: it needs the network, and
a subscription that can expire.

```
make e2e
```

## Requirements

Chrome comes from the system rather than playwright, because playwright's
chromium is built without the credentials it needs to register with FCM. The
push API is also unavailable in incognito, which is what a browser context
gives you unless it is persistent.

```
pnpm exec playwright install firefox
```

A browser that is not installed skips rather than fails.

The playwright runner drives it, so `pnpm exec playwright test --ui` and the
usual reporters work.

# webcrypto-web-push

Monorepo for [`@block65/webcrypto-web-push`](./packages/web-push) — send
notifications using the Web Push Protocol and Web Crypto APIs.

Installation and usage are documented in the
[package README](./packages/web-push/README.md).

## Packages

| Package                                    | Description                                          |
| ------------------------------------------ | ---------------------------------------------------- |
| [`packages/web-push`](./packages/web-push) | The published library, `@block65/webcrypto-web-push` |

## Examples

| Example                                                        | Description                                         |
| -------------------------------------------------------------- | --------------------------------------------------- |
| [`examples/browser`](./examples/browser)                       | Vite and React app that subscribes to notifications |
| [`examples/cloudflare-workers`](./examples/cloudflare-workers) | Hono worker that stores subscriptions in D1         |
| [`examples/nodejs`](./examples/nodejs)                         | Hono server that stores subscriptions in SQLite     |

## Development

```
make          # build
make test     # typecheck, unit tests and smoketest
make lint     # oxlint
make format   # oxfmt
```

## License

MIT. See [LICENSE.md](./packages/web-push/LICENSE.md).

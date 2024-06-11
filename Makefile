
SRCS = $(wildcard lib/**)

all: dist

.PHONY: clean
clean:
	pnpm tsc -b --clean

.PHONY: test
test: node_modules
	pnpm exec vitest
	$(MAKE) smoketest

node_modules: package.json
	pnpm install

dist: node_modules lib/tsconfig.json $(SRCS)
	pnpm exec tsc -b lib

.PHONY: dist-watch
dist-watch:
	pnpm exec tsc -w --preserveWatchOutput

.PHONY: pretty
pretty: node_modules
	pnpm exec eslint --fix .
	pnpm exec prettier --write .

.PHONY: dev-server
dev-server: node_modules
	pnpm exec wrangler dev src/worker.ts

.PHONY: smoketest
smoketest: dist
	pnpm exec node -e "import('@block65/webcrypto-web-push').then(() => console.log('smoketest ok')).catch(console.error)"
